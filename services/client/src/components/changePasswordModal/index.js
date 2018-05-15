import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import form from 'decorators/form';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import ButtonLink from 'components/buttonLink';
import Modal from 'components/modal';
import { Form, Input, Label } from 'components/form';

import style from './index.css';

@graphql(gql`
  mutation userLoggedChangePassword ($input: UserLoggedChangePasswordInput!) {
    user: userLoggedChangePassword (input: $input) {
      id
    }
  }
`, {
  props: ({
    mutate
  }) => ({
    changeMyPassword: async ({ oldPassword, newPassword }) => {
      try {
        await mutate({
          variables: {
            input: {
              oldPassword,
              newPassword
            }
          }
        });
        analytics.track('USER_CHANGE_MY_PASSWORD');
      } catch (e) {
        analytics.track('USER_CHANGE_MY_PASSWORD_ERROR', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@form({
  id: 'change_password',
  initialState: () => ({
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  })
})
@withStyles(style)
export default class ChangePasswordModal extends PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };
  static defaultProps = {
    isOpen: false,
    onClose: d => d
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      submitLocked: false
    };
  }

  @autobind
  _submit (e) {
    e.preventDefault();
    if (this.state.submitLocked) return;
    if (this._isValid()) {
      this.setState({
        submitLocked: true
      }, async () => {
        try {
          await this.props.changeMyPassword(this.props.form.toJSON());
          this.props.onClose();
        } catch (e) {}
        this.setState({
          submitLocked: false
        });
      });
    }
  }

  @autobind
  _close () {
    this.props.onClose();
  }

  _isValid () {
    return Boolean(
      !!this.props.form.get('oldPassword') &&
      !!this.props.form.get('newPassword') &&
      this.props.form.get('newPassword') === this.props.form.get('newPasswordRepeat')
    );
  }

  render () {
    return (
      <Modal isOpen={this.props.isOpen} onClose={this._close} maxWidth={600} className={style.changePassword}>
        <Form className='form-horizontal' onSubmit={this._submit}>
          <div className='form-group'>
            <Label className='col-xs-12 col-sm-5'>Current Password</Label>
            <div className='col-xs-12 col-sm-7'>
              <Input
                background='greyLightest'
                focus
                type='password'
                value={this.props.form.get('oldPassword')}
                onChange={oldPassword => this.props.updateForm({ oldPassword })}
                disabled={this.state.submitLocked}
              />
            </div>
          </div>
          <div className='form-group'>
            <Label className='col-xs-12 col-sm-5'>New Password</Label>
            <div className='col-xs-12 col-sm-7'>
              <Input
                background='greyLightest'
                type='password'
                value={this.props.form.get('newPassword')}
                onChange={newPassword => this.props.updateForm({ newPassword })}
                disabled={this.state.submitLocked}
              />
            </div>
          </div>
          <div className='form-group'>
            <Label className='col-xs-12 col-sm-5'>Re-type New Password</Label>
            <div className='col-xs-12 col-sm-7'>
              <Input
                background='greyLightest'
                type='password'
                value={this.props.form.get('newPasswordRepeat')}
                onChange={newPasswordRepeat => this.props.updateForm({ newPasswordRepeat })}
                disabled={this.state.submitLocked}
              />
            </div>
          </div>
          <div className='form-actions'>
            <ButtonLink
              type='submit'
              text='Save'
              size='md'
              disabled={!this._isValid() || this.state.submitLocked}
            />
          </div>
        </Form>
      </Modal>
    );
  }
}
