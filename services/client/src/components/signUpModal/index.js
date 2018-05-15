import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { setLoggedIn, setIdentified } from 'state/redux/actions/app/auth';
import analytics from 'io/analytics';
import userFragment from 'fragments/user';
import reload from 'lib/reload';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Modal from 'components/modal';
import Logo from 'components/logo';
import form from 'decorators/form';
import ButtonLink from 'components/buttonLink';
import {
  Form,
  Input,
  Label,
  Dropdown,
  Phone
} from '../../components/form';

import style from './index.css';

@form({
  id: 'signup-modal',
  initialState: (props) => ({
    currentSignupStep: 1,
    mutationPending: false,
    hasInteractedWithSignupStep1: false,
    hasInteractedWithSignupStep2: false,
    user: {
      email: '',
      password: '',
      name: '',
      utmSource: props.location.query.utm_source || null,
      utmMedium: props.location.query.utm_medium || null,
      utmCampaign: props.location.query.utm_campaign || null,
      utmContent: props.location.query.utm_content || null,
      phoneNumber: null
    }
  })
})
@graphql(gql`
  mutation userSignup ($input: UserSignupInput!) {
    user: userSignup (input: $input) {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate
  }) => ({
    signupStep1: (data) => mutate({
      variables: {
        input: data
      }
    })
  })
})
@graphql(gql`
  mutation userCompleteSignup ($input: UserCompleteSignupInput!) {
    user: userCompleteSignup (input: $input) {
      ...UserFragment
      token
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate
  }) => ({
    signupStep2: (data) => mutate({
      variables: {
        input: data
      }
    })
  })
})
@connect(
  (state, props) => ({
    windowWidth: state.app.getIn(['browser', 'window']).width
  }),
  (dispatch, props) => ({
    actions: {
      setLoggedIn: token => dispatch(setLoggedIn(token)),
      setIdentified: user => dispatch(setIdentified(user))
    }
  })
)
@withStyles(style)
export default class SignUpModal extends PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  }

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  async _onStep1Submit (e) {
    e && e.preventDefault && e.preventDefault();

    if (this.props.form.get('mutationPending')) return;
    const userData = this.props.form.get('user').toJSON();

    try {
      this.props.setInForm(['mutationPending'], true);
      analytics.track('BOOST_SIGNUP_STEP_1_ATTEMPTED', {
        email: userData.email,
        utmSource: userData.utmSource,
        utmMedium: userData.utmMedium,
        utmCampaign: userData.utmCampaign,
        utmContent: userData.utmContent
      });
      const { data: { user } } = await this.props.signupStep1({
        email: userData.email,
        utmSource: userData.utmSource,
        utmMedium: userData.utmMedium,
        utmCampaign: userData.utmCampaign,
        utmContent: userData.utmContent
      });

      this.props.actions.setIdentified(user);
      this.props.setInForm(['currentSignupStep'], 2);

      analytics.track('BOOST_SIGNUP_STEP_1_COMPLETED');
    } catch (e) {
      if (e && e.message === 'GraphQL error: You already have an account. Please log in.') {
        this.props.router.push(`/login?email=${userData.email}`);
        return;
      }

      if (__DEV__) console.trace(e);
      analytics.track('BOOST_SIGNUP_STEP_1_FAILED', {
        message: e.message,
        email: userData.email,
        utmSource: userData.utmSource,
        utmMedium: userData.utmMedium,
        utmCampaign: userData.utmCampaign,
        utmContent: userData.utmContent
      });
    }
    this.props.setInForm(['mutationPending'], false);
  }

  @autobind
  async _onStep2Submit (e) {
    e && e.preventDefault && e.preventDefault();
    if (this.props.form.get('mutationPending')) return;

    const userData = this.props.form.get('user').toJSON();

    try {
      this.props.setInForm(['mutationPending'], true);
      analytics.track('BOOST_SIGNUP_STEP_2_ATTEMPTED', {
        email: userData.email,
        name: userData.name
      });
      const { data: { user } } = await this.props.signupStep2({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        phoneNumber: userData.phoneNumber
      });
      this.props.actions.setIdentified(user);
      this.props.actions.setLoggedIn(user.token);
      analytics.track('BOOST_SIGNUP_STEP_2_COMPLETED');
      reload('/');
    } catch (e) {
      if (__DEV__) console.trace(e);
      analytics.track('BOOST_SIGNUP_STEP_2_FAILED', {
        message: e.message,
        email: userData.email,
        name: userData.name
      });
      this.props.setInForm(['mutationPending'], false);
    }
  }

  @autobind
  _onChangeSignup (data) {
    this.props.setInForm(['user'], data);
    const step = this.props.form.get('currentSignupStep');
    if (step === 1 && !this.props.form.get('hasInteractedWithSignupStep1')) {
      analytics.track('BOOST_SIGNUP_STEP_1_HAS_INTERACTED');
      this.props.setInForm(['hasInteractedWithSignupStep1'], true);
    } else if (step === 2 && !this.props.form.get('hasInteractedWithSignupStep2')) {
      analytics.track('BOOST_SIGNUP_STEP_2_HAS_INTERACTED');
      this.props.setInForm(['hasInteractedWithSignupStep2'], true);
    }
  }

  @autobind
  _onChangeEmail (email) {
    if (this.props.form.get('mutationPending')) return;
    this._onChangeSignup({
      ...this.props.form.get('user').toJSON(),
      email
    });
  }

  @autobind
  _onChangePassword (password) {
    if (this.props.form.get('mutationPending')) return;
    this._onChangeSignup({
      ...this.props.form.get('user').toJSON(),
      password
    });
  }

  @autobind
  _onChangeName (name) {
    if (this.props.form.get('mutationPending')) return;
    this._onChangeSignup({
      ...this.props.form.get('user').toJSON(),
      name
    });
  }

  @autobind
  _onChangePhoneNumber (phoneNumber) {
    if (this.props.form.get('mutationPending')) return;
    this.props.setInForm(['user', 'phoneNumber'], phoneNumber);
  }

  render () {
    const renderAsLeadGen = this.props.leadGenerationStyle && this.props.form.get('currentSignupStep') === 1;

    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        maxWidth={400}
        className={classNames(style.signUpModal, renderAsLeadGen ? style.leadGenSignupModal : '')}>
        {this.props.form.get('currentSignupStep') === 1 ? <Form className={style.step1} onSubmit={this._onStep1Submit}>
          {renderAsLeadGen ? (
            <div>
              <Logo className={style.logo} lightTheme={true}/>
              <h3>Join thousands of other professionals & gain your edge.</h3>
              <p>
                Get great content delivered to your inbox & a personal coach for career success.
              </p>
              <div className={style.leadGenActions}>
                <Input
                  type='text'
                  name='boost_user_email'
                  focus
                  placeholder='Email Address'
                  value={this.props.form.getIn(['user', 'email'])}
                  onChange={this._onChangeEmail}
                />
                <ButtonLink
                  type='submit'
                  text='Submit'
                  className={style.submitButton}
                  uppercase={true}
                  icon='61812'
                  iconPlacement='right'
                  loading={this.props.form.get('mutationPending')}
                  loadingText='Saving...'
                />
              </div>
            </div>
          ) : (
            <div>
              <div className={style.header}>
                Sign Up
              </div>
              <Label>Email Address</Label>
              <Input
                type='text'
                name='boost_user_email'
                focus
                background='greyLightest'
                placeholder='ex: your@email.com'
                value={this.props.form.getIn(['user', 'email'])}
                onChange={this._onChangeEmail}
              />
              <ButtonLink
                type='submit'
                text='Next'
                uppercase={true}
                icon='61812'
                iconPlacement='right'
                loading={this.props.form.get('mutationPending')}
                loadingText='Saving...'
              />
            </div>
          )}
        </Form> : null}
        {this.props.form.get('currentSignupStep') === 2 ? <Form className={style.step2} onSubmit={this._onStep2Submit}>
          <div className={style.formRow}>
            <Label>Full name</Label>
            <Input
              type='text'
              name='boost_user_name'
              focus
              tabIndex={1}
              background='greyLightest'
              placeholder='ex: Elon Musk'
              value={this.props.form.getIn(['user', 'name'])}
              onChange={this._onChangeName}
            />
          </div>
          <div className={style.formRow}>
            <Label>Password</Label>
            <Input
              name='boost_user_password'
              type='password'
              tabIndex={2}
              background='greyLightest'
              value={this.props.form.getIn(['user', 'password'])}
              onChange={this._onChangePassword}
            />
          </div>
          <div className={style.formRow}>
            <Label>Phone Number</Label>
            <Phone
              className={style.phone}
              tabIndex={4}
              name='boost_phone_number'
              background='greyLightest'
              onChange={this._onChangePhoneNumber}
              value={this.props.form.getIn(['user', 'phoneNumber'])}
            />
          </div>
          <ButtonLink
            type='submit'
            text='Done'
            uppercase={true}
            icon='61812'
            iconPlacement='right'
            loading={this.props.form.get('mutationPending')}
            loadingText='Saving...'
          />
        </Form> : null}
      </Modal>
    );
  }

}
