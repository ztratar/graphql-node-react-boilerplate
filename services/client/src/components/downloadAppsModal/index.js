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

import downloadOnAppStoreSVG from '../../assets/images/downloadAppStore.svg';

import style from './index.css';

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
export default class DownloadAppsModal extends PureComponent {
  static propTypes = {
    onClose: PropTypes.func.isRequired
  };

  constructor (props, context) {
    super(props, context);
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
        className={style.textModal}
        disableBackgroundClose={true}
        onClose={this._onClickSkipSMS}>
        <span className={style.textemoji}>📱</span>
        <h2>Download the mobile app!</h2>
        <p>
          For the best experience, we highly recommend you download Boost onto your iPhone or Android device.
        </p>
        <div className={style.buttons}>
          <a
            href='https://itunes.apple.com/app/id1247607973'
            target='_blank'
            className={style.iosButton}
            dangerouslySetInnerHTML={{__html: downloadOnAppStoreSVG}}
          ></a>
          <a
            className={style.androidButton}
            href='https://play.google.com/store/apps/details?id=io.getboost.app&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'
          /></a>
        </div>
        <div>
          <a href='#' onClick={this.props.onClickSms}>I want to enable texting instead</a>
        </div>
        <div>
          <a href='#' onClick={this._onClickSkipSMS}>No thanks - I will log into the website to chat</a>
        </div>
      </Modal>
    );
  }
}
