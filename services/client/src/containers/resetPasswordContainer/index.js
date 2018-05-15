import React from 'react';
import classNames from 'classnames';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { autobind } from 'core-decorators';

import _ from 'underscore';
import { Link } from 'react-router';

import reload from 'lib/reload';
import withStyles from 'isomorph-style-loader/lib/withStyles';
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
}];

@form({
  id: 'resetPasswordForm',
  initialState: {
    mutationPending: false,
    isFinished: false,
    password1: '',
    password2: ''
  }
})
@graphql(gql`
  mutation userChangePassword ($input: UserChangePasswordInput!) {
    resetPassword: userChangePassword (input: $input) {
      id
    }
  }
`, {
  props: ({
    mutate,
    ownProps: {
      form,
      setInForm
    }
  }) => ({
    submitResetPassword: async ({ password, token }) => {
      try {
        if (form.get('mutationPending')) return;

        setInForm(['mutationPending'], true);

        analytics.track('RESET_PASSWORD');

        await mutate({
          variables: {
            input: {
              password,
              token
            }
          }
        });

        analytics.track('RESET_PASSWORD_SUCCESS');

        setInForm(['isFinished'], true);

        reload('/login', 3000);

      } catch (e) {
        setInForm(['mutationPending'], false);
        analytics.track('RESET_PASSWORD_ERROR', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@withStyles(style)
export default class ResetPasswordContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  componentDidMount () {
    this.refs.password.refs.composedComponent.refs.input.focus();
  }

  @autobind
  _onSubmit (e) {
    e.preventDefault();

    if (!this._isValid()) return;

    const password = this.props.form.get('password1');

    const token = this.props.location.query.reset_token;

    this.props.submitResetPassword({
      password,
      token
    });
  }

  @autobind
  _isValid () {
    const password1 = this.props.form.get('password1');
    const password2 = this.props.form.get('password2');
    return Boolean(
      password1 &&
      password1.length > 0 &&
      password1 === password2
    );
  }

  render () {
    return (
      <div className={style.resetPasswordContainer}>
        <VerticalCenter>
          <h1>Pick a new password</h1>
          {this.props.form.getIn(['isFinished']) ? (
            <Box className={style.done}>
              <h2>Password reset! Redirecting you to login...</h2>
            </Box>
          ) : (
            <Form style='smallBox' onSubmit={this._onSubmit}>
              <div className='form-group row'>
                <Label className='col-xs-12'>New Password</Label>
                <div className='col-xs-12'>
                  <Input
                    name='password1'
                    type='password'
                    background='greyLightest'
                    ref='password'
                    focus
                    value={this.props.form.getIn(['password1'])}
                    onChange={password1 => this.props.updateForm({
                      password1
                    })}
                  />
                </div>
              </div>
              <div className='form-group row'>
                <Label className='col-xs-12'>Re-type New Password</Label>
                <div className='col-xs-12'>
                  <Input
                    name='password2'
                    type='password'
                    background='greyLightest'
                    ref='password'
                    value={this.props.form.getIn(['password2'])}
                    onChange={password2 => this.props.updateForm({
                      password2
                    })}
                  />
                </div>
              </div>
              <div className={classNames('row', formStyle.smallBoxActions)}>
                <div className='col-xs-12'>
                  <ButtonLink
                    loading={this.props.form.get('mutationPending')}
                    type='submit'
                    text='Submit'
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
