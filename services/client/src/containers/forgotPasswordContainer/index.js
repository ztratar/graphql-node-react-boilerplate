import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { autobind } from 'core-decorators';
import { Link } from 'react-router';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import reload from 'lib/reload';
import PureComponent from 'components/common/pure';
import ButtonLink from 'components/buttonLink';
import VerticalCenter from 'components/verticalCenter';
import Box from 'components/box';
import BottomLinks from 'components/bottomLinks';
import {
  Form,
  Input,
  Label
} from 'components/form';

import form from '../../decorators/form';
import style from './index.css';
import formStyle from 'components/form/index.css';

const BOTTOM_LINKS = [{
  displayText: 'Home',
  href: '/'
}, {
  displayText: 'Log In',
  href: '/login'
}];

@form({
  id: 'forgotPasswordForm',
  initialState: {
    mutationPending: false,
    isFinished: false,
    email: ''
  }
})
@graphql(gql`
  mutation userForgotPassword ($input: UserForgotPasswordInput!) {
    userForgotPassword (input: $input)
  }
`, {
  props: ({
    mutate,
    ownProps: {
      form,
      setInForm
    }
  }) => ({
    submitForgotPassword: async (email) => {
      try {
        if (form.get('mutationPending')) return;

        setInForm(['mutationPending'], true);

        analytics.track('FORGOT_PASSWORD');

        await mutate({
          variables: {
            input: {
              email
            }
          }
        });

        analytics.track('FORGOT_PASSWORD_SUCCESS');

        setInForm(['isFinished'], true);

        reload('/', 5000);
      } catch (e) {
        analytics.track('FORGOT_PASSWORD_ERROR', {
          message: e.message
        });
        setInForm(['mutationPending'], false);
        throw e;
      }
    }
  })
})
@withStyles(style)
export default class ForgotPasswordContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  componentDidMount () {
    this.refs.email.refs.composedComponent.refs.input.focus();
  }

  @autobind
  _onSubmit (e) {
    e.preventDefault();
    if (!this._isValid()) return;
    this.props.submitForgotPassword(this.props.form.getIn(['email']));
  }

  @autobind
  _isValid () {
    const email = this.props.form.get('email');
    return Boolean(
      email &&
      email.length > 0
    );
  }

  render () {
    return (
      <div className={style.forgotPasswordContainer}>
        <VerticalCenter>
          <h1>Forgot Password</h1>
          {this.props.form.getIn(['isFinished']) ? (
            <Box className={style.done}>
              <h2>Great! We've sent you an email to reset your password.</h2>
              <p>If you don't see an email, please contact us at support@jobstart.com.</p>
            </Box>
          ) : (
            <Form style='smallBox' onSubmit={this._onSubmit}>
              <p>
                Enter your email and we will send you a link to reset your password.
              </p>
              <div className='form-group row'>
                <Label className='col-xs-12'>Email</Label>
                <div className='col-xs-12'>
                  <Input
                    type='email'
                    background='greyLightest'
                    ref='email'
                    focus
                    value={this.props.form.getIn(['email'])}
                    onChange={email => this.props.updateForm({
                      email
                    })}
                  />
                </div>
              </div>
              <div className={classNames('row', formStyle.smallBoxActions)}>
                <div className='col-xs-12'>
                  <ButtonLink
                    loading={this.props.form.get('mutationPending')}
                    type='submit'
                    text='Send email'
                    size='lg'
                    uppercase={true}
                    disabled={!this._isValid()}
                    className={style.button}
                  />
                </div>
              </div>
          </Form>
          )}
          <BottomLinks items={BOTTOM_LINKS}/>
        </VerticalCenter>
      </div>
    );
  }
}
