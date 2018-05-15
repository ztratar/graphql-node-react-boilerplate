import React from 'react';
import classNames from 'classnames';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag'
import withStyles from 'isomorph-style-loader/lib/withStyles';
import _ from 'underscore';
import { autobind } from 'core-decorators';
import { Link } from 'react-router';

import userFragment from '../../fragments/user';
import reload from '../../lib/reload';
import { setLoggedIn, setIdentified } from '../../state/redux/actions/app/auth';
import form from '../../decorators/form';
import PureComponent from '../../components/common/pure';
import Logo from '../../components/logo';
import ButtonLink from '../../components/buttonLink';
import VerticalCenter from '../../components/verticalCenter';
import BottomLinks from '../../components/bottomLinks';
import formStyle from '../../components/form/index.css';
import analytics from '../../io/analytics';
import {
  Form,
  Input,
  Label
} from '../../components/form';

import style from './index.css';

const BOTTOM_LINKS = [{
  displayText: 'Home',
  href: '/'
}, {
  displayText: 'Forgot password',
  href: '/forgot_password'
}];

@connect(
  () => ({}),
  (dispatch, props) => ({
    actions: {
      identify: (user) => {
        dispatch(setIdentified(user));
        dispatch(setLoggedIn(user.token));
      }
    }
  })
)
@form({
  id: 'login-form',
  initialState: {
    mutationPending: false,
    email: '',
    password: ''
  }
})
@graphql(gql`
  mutation userLogin ($input: UserLoginInput!) {
    user: userLogin (input: $input) {
      ...UserFragment
      token
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate,
    ownProps: {
      setInForm,
      form,
      actions: {
        identify
      }
    }
  }) => ({
    login: async (input) => {
      try {
        if (form.get('mutationPending')) return;

        setInForm(['mutationPending'], true);

        analytics.track('USER_LOGIN');

        const { data: { user } } = await mutate({
          variables: {
            input
          }
        });

        analytics.track('USER_LOGIN_SUCCESS');

        identify(user);

        reload('/');
      } catch (e) {
        setInForm(['mutationPending'], false);
        analytics.track('USER_LOGIN_ERROR', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@withStyles(style)
export default class LogInContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  componentDidMount () {
    if (this.props.location
      && this.props.location.query
      && this.props.location.query.email
    ) {
      this.props.updateForm({
        email: this.props.location.query.email
      });
    }
  }

  @autobind
  _onChangeEmail (email) {
    this.props.updateForm({
      email
    })
  }

  @autobind
  _onChangePassword (password) {
    this.props.updateForm({
      password
    });
  }

  @autobind
  _onSubmit (e) {
    e.preventDefault();
    if (this._isValid()) {
      const email = this.props.form.get('email');
      const password = this.props.form.get('password');
      this.props.login({
        email,
        password
      });
    }
  }

  _isValid () {
    const email = this.props.form.get('email');
    const password = this.props.form.get('password');
    return Boolean(
      email &&
      email.length > 0 &&
      password &&
      password.length > 0
    );
  }

  render () {
    return (
      <div className={style.logInContainer}>
        <VerticalCenter>
          <Link to='/' >
            <Logo/>
          </Link>
          <Form style='smallBox' onSubmit={this._onSubmit}>
            <div className='form-group row'>
              <Label className='col-xs-12'>Email</Label>
              <div className='col-xs-12'>
                <Input
                  type='text'
                  background='greyLightest'
                  value={this.props.form.get('email')}
                  onChange={this._onChangeEmail}
                  focus={!this.props.form.get('email')}
                />
              </div>
            </div>
            <div className='form-group row'>
              <Label className='col-xs-12'>Password</Label>
              <div className='col-xs-12'>
                <Input
                  type='password'
                  background='greyLightest'
                  value={this.props.form.get('password')}
                  onChange={this._onChangePassword}
                />
              </div>
            </div>
            <div className={classNames('row', formStyle.smallBoxActions)}>
              <div className='col-xs-12'>
                <ButtonLink
                  type='submit'
                  text='Log In'
                  size='lg'
                  loading={this.props.form.get('mutationPending')}
                  loadingText='Logging in...'
                  uppercase={true}
                  disabled={!this._isValid()}
                  className={style.button}
                />
              </div>
            </div>
          </Form>
          <BottomLinks items={BOTTOM_LINKS}/>
        </VerticalCenter>
      </div>
    );
  }
}
