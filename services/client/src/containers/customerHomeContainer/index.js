import React from 'react';
import moment from 'moment';
import _ from 'underscore';
import { connect } from 'react-redux';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import debug from 'debug';
import ReactScroll from 'react-scroll';
import { autobind, throttle, debounce } from 'core-decorators';
import cookie from 'react-cookie';
import { Link, withRouter } from 'react-router';

import form from 'decorators/form';
import PureComponent from 'components/common/pure';
import Avatar from 'components/avatar';
import Loader from 'components/loader';
import ButtonLink from 'components/buttonLink'
import InfiniteScrollView from 'components/infiniteScrollView';
import Modal from 'components/modal';
import Icon from 'components/icon';
import VerticalCenter from 'components/verticalCenter';
import PaymentForm from 'components/paymentForm';
import { Experiment, Variant } from 'components/experiment';

import {
  add as addAlert
} from 'state/redux/actions/app/alerts';
import { mapLeft, uniq } from 'functions/arrays';

import userFragment from 'fragments/user';

import analytics from 'io/analytics';

import style from './index.css';

const log = debug('client:containers:customer_home_container');

@connect(
  (state, props) => ({
    scrollOffset: state.app.getIn(['browser', 'bodyScrollOffset']),
    windowHeight: state.app.getIn(['browser', 'window']).height,
    windowWidth: state.app.getIn(['browser', 'window']).width
  }),
  (dispatch) => ({
    actions: {
      shownInitialBoostMessages: () => dispatch(shownInitialBoostMessages()),
      addAlert: (opts) => dispatch(addAlert(opts))
    }
  })
)
@withRouter
@form({
  id: 'customer-home-container',
  initialState: {
    showCreditCardModal: false
  }
})
@graphql(gql`
  query getMyUser {
    user: getMyUser {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  options: {
    fetchPolicy: 'cache-and-network'
  },
  props: ({
    data: {
      user,
      loading: userLoading
    }
  }) => ({
    user,
    userLoading
  })
})
@withStyles(style)
export default class CustomerHomeContainer extends PureComponent {
  static defaultProps = {
    messages: []
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onClickOpenPayment () {
    this.props.setInForm(['showCreditCardModal'], true);
    return false;
  }

  @autobind
  _onClosePayment () {
    this.props.setInForm(['showCreditCardModal'], false);
    return false;
  }

  render () {
    const { user = {} } = this.props;

    const userPaid = user.hasConnectedBilling && user.selectedPlan;

    if (this.props.userLoading) return (
      <div className={style.customerHomeContainer}>
        <div className={style.customerHomeWrapper}>
          <Loader type='pageLoader' />
        </div>
      </div>
    );

    return (
      <div className={style.customerHomeContainer}>
        <Modal
          isOpen={this.props.form.getIn(['showCreditCardModal'])}
          className={style.paymentModal}
          onClose={this._onClosePayment}
        >
          <h2>Pay $100 upfront to get instant access</h2>
          <p>Enter your credit card information to access all of Jobstart's features now.</p>
          <PaymentForm
            name='payment-form-user-path'
            paymentButtonText='Pay now'
            onComplete={() => {
              this.props.setInForm(['showCreditCardModal'], false);
            }}
          />
        </Modal>
        <h2>User Home</h2>
        {userPaid ? (
          <span>You have paid</span>
        ) : (
          <ButtonLink
            text='Pay to access site'
            onClick={this._onClickOpenPayment}
          />
        )}
      </div>
    );
  }

}
