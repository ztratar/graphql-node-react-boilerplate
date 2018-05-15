import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { autobind } from 'core-decorators';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import PureComponent from 'components/common/pure';
import Modal from 'components/modal';
import ButtonLink from 'components/buttonLink';

import form from 'decorators/form';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import {
  Form,
  Textarea,
  Phone
} from 'components/form';
import {
  add as addAlert
} from 'state/redux/actions/app/alerts';
import userFragment from 'fragments/user';
import analytics from 'io/analytics';

import style from './index.css';

@connect(
  (state, props) => ({}),
  (dispatch) => ({
    actions: {
      addAlert: (opts) => dispatch(addAlert(opts))
    }
  })
)
@form({
  id: 'enable-sms-modal',
  initialState: {
    phoneNumber: '',
    smsEnableLoading: false
  }
})
@graphql(gql`
  mutation userEnableSMS ($input: UserEnableSMSInput!) {
    user: userEnableSMS (input: $input) {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate
  }) => ({
    userEnableSMS: async ({
      phoneNumber
    }) => {
      analytics.track('USER_ENABLE_SMS');
      try {
        const user = await mutate({
          variables: {
            input: {
              phoneNumber
            }
          }
        });
        analytics.track('UPDATE_ENABLE_SMS_SUCCESS');
        return user;
      } catch (e) {
        analytics.track('UPDATE_ENABLE_SMS_FAILURE', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@graphql(gql`
  mutation seenSMSModal {
    user: userSeenSMSModal {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    mutate
  }) => ({
    seenSMSModal: async () => {
      analytics.track('SEEN_SMS_MODAL');
      try {
        await mutate();
        analytics.track('SEEN_SMS_MODAL_SUCCESS');
      } catch (e) {
        analytics.track('SEEN_SMS_MODAL_FAILURE', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@withStyles(style)
export default class EnableSmsModal extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func.isRequired
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  async _onSubmitSMSModal (e) {
    e && e.preventDefault && e.preventDefault();

    if (this.props.form.get('smsEnableLoading')) return;

    this.props.setInForm(['smsEnableLoading'], true);

    try {
      const { data: { user } } = await this.props.userEnableSMS({
        phoneNumber: this.props.form.get('phoneNumber')
      });
    } catch (e) {
      this.props.setInForm(['smsEnableLoading'], false);
      return false;
    }

    this.props.setInForm(['smsEnableLoading'], false);
    this.props.actions.addAlert({
      text: 'SMS Enabled!',
      color: '#11D79D',
      timeout: 3000
    });
    this.props.onClose();
  }

  @autobind
  async _onClickSkipSMS () {
    if (__CLIENT__) {
      this.props.seenSMSModal();
    }

    this.props.onClose();
  }

  render () {
    return (
      <Modal
        isOpen={this.props.isOpen}
        showClose={false}
        className={style.textModal}
        disableBackgroundClose={true}
        onClose={this.props.onClose}>
        <span className={style.textemoji}>📱</span>
        <h2>Text with us!</h2>
        <p>
          For the best experience, enable SMS integration by entering your phone number.
        </p>
        <Form onSubmit={this._onSubmitSMSModal}>
          <Phone
            background='greyLightest'
            value={this.props.form.get('phoneNumber')}
            onChange={phoneNumber => this.props.setInForm(['phoneNumber'], phoneNumber)}
          />
          <ButtonLink
            text='Enable'
            type='submit'
            uppercase={true}
            className={style.textSaveButton}
            loading={this.props.form.get('smsEnableLoading')}
            loadingText='Enabling...'
          />
          <a href='#' onClick={this._onClickSkipSMS}>No thanks - I will log into the website to chat</a>
        </Form>
      </Modal>
    );
  }
}
