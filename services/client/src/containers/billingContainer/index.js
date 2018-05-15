import React from 'react';
import _ from 'underscore';
import moment from 'moment';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { add as addAlert } from 'state/redux/actions/app/alerts';
import ButtonLink from 'components/buttonLink';
import PureComponent from 'components/common/pure';
import Loader from 'components/loader';
import analytics from 'io/analytics';
import Box from 'components/box';
import Icon from 'components/icon';
import {
  Form,
  Label,
  Dropdown,
  Input,
  Textarea,
  Slider,
  UploadButton
} from 'components/form';
import PaymentForm from 'components/paymentForm';
import ConfirmModal from 'components/confirmModal';
import Modal from 'components/modal';

import form from 'decorators/form';
import style from './index.css';
import userFragment from '../../fragments/user';

@form({
  id: 'form',
  initialState: ({ }) => ({
    updatePlanMutationInProgress: false,
    showDeactiveAccountModal: false,
    showCreditCardModal: false,
    showCouponModal: false,
    couponMutationInProgress: false,
    performerLoading: false,
    achieverLoading: false,
    influencerLoading: false
  })
})
@connect(
  (state, props) => ({}),
  (dispatch) => ({
    actions: {
      addAlert: (opts) => dispatch(addAlert(opts))
    }
  })
)
@graphql(gql`
  query getMyUser {
    user: getMyUser {
      ...UserFragment
      Transactions {
        id
        amount
        paid
        status
        createdAt
        cardLast4
      }
    }
  }
  ${userFragment}
`, {
  props: ({
    data: {
      user,
      loading
    }
  }) => {
    return {
      user,
      loading
    }
  }
})
@graphql(gql`
  mutation userUpdatePlan ($input: UserUpdatePlanInput!) {
    user: userUpdatePlan (input: $input) {
      id
      selectedPlan
      hasConnectedBilling
      hasInvalidBilling
      stripeCardLast4
    }
  }
`, {
  props: ({
    mutate,
    ownProps: {
      setInForm,
      form
    }
  }) => ({
    userUpdatePlan: async ({
      selectedPlan
    }) => {
      if (form.get('updatePlanMutationInProgress')) return;

      setInForm(['updatePlanMutationInProgress'], true);

      analytics.track(`USER_UPDATE_PLAN_${selectedPlan.toUpperCase()}`);
      try {
        const user = await mutate({
          variables: {
            input: {
              selectedPlan
            }
          }
        });
        analytics.track(`UPDATE_UPDATE_PLAN_${selectedPlan.toUpperCase()}_SUCCESS`);
        setInForm(['updatePlanMutationInProgress'], false);
        return user;
      } catch (e) {
        analytics.track(`UPDATE_UPDATE_PLAN_${selectedPlan.toUpperCase()}_FAILURE`, {
          message: e.message
        });
        setInForm(['updatePlanMutationInProgress'], false);
        throw e;
      }
    }
  })
})
@graphql(gql`
  mutation userAddCoupon ($input: UserAddCouponInput!) {
    user: userAddCoupon (input: $input) {
      id
    }
  }
`, {
  props: ({
    mutate,
    ownProps: {
      form,
      setInForm,
      actions
    }
  }) => ({
    userAddCoupon: async (couponCode) => {
      if (form.get('couponMutationInProgress')) return;

      setInForm(['couponMutationInProgress'], true);
      analytics.track('USER_APPLY_COUPON');
      try {
        const user = await mutate({
          variables: {
            input: {
              couponCode
            }
          }
        });
        analytics.track('USER_APPLY_COUPON_SUCCESS');
        actions.addAlert({
          text: 'Coupon added to your account!',
          color: '#11D79D',
          timeout: 3000
        });
        setInForm(['couponMutationInProgress'], false);
        return user;
      } catch (e) {
        analytics.track('USER_APPLY_COUPON_FAILURE', {
          message: e.message
        });
        setInForm(['couponMutationInProgress'], false);
        throw e;
      }
    }
  })
})
@graphql(gql`
  mutation userCancelPlan {
    user: userCancelPlan {
      id
      selectedPlan
      hasConnectedBilling
      hasInvalidBilling
      stripeCardLast4
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
    userCancelPlan: async () => {
      if (form.get('updatePlanMutationInProgress')) return;

      setInForm(['updatePlanMutationInProgress'], true);
      analytics.track('USER_CANCEL_PLAN');
      try {
        const user = await mutate();
        analytics.track('UPDATE_CANCEL_PLAN_SUCCESS');
        setInForm(['updatePlanMutationInProgress'], false);
        return user;
      } catch (e) {
        analytics.track('UPDATE_CANCEL_PLAN_FAILURE', {
          message: e.message
        });
        setInForm(['updatePlanMutationInProgress'], false);
        throw e;
      }
    }
  })
})
@withStyles(style)
export default class BillingContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  @autobind
  async _onClickChangePlanAchiever () {
    if (this.props.user && this.props.user.selectedPlan === 'achiever') {
      if (this.props.user.hasConnectedBilling) return false;
      return this.props.setInForm(['showCreditCardModal'], true);
    }

    this.props.setInForm(['achieverLoading'], true);

    await this.props.userUpdatePlan({
      selectedPlan: 'achiever'
    });

    this.props.setInForm(['achieverLoading'], false);

    if (!this.props.user.hasConnectedBilling) this.props.setInForm(['showCreditCardModal'], true);
  }

  render () {
    if (this.props.loading || !this.props.user) {
      return (
        <Loader
          type='pageLoader'
        />
      );
    }

    const { user } = this.props;
    const hasActiveCohort = user && user.Cohort && user.Cohort.id && Date.now() < Date.parse(user.Cohort.endsAt);

    if (hasActiveCohort) {
      return (
        <div className={style.billingContainer}>
          <Modal
            isOpen={this.props.form.getIn(['showCreditCardModal'])}
            className={style.paymentModal}
            onClose={() => {
              this.props.setInForm(['showCreditCardModal'], false);
            }}
          >
            <h2>Edit your credit card information</h2>
            { !this.props.user.hasConnectedBilling ? <p>Topics will be credited to your account and your card will be charged once your information is entered.</p> : null }
            <PaymentForm
              name='payment-form'
              onComplete={() => {
                this.props.setInForm(['showCreditCardModal'], false);
              }}
            />
          </Modal>
          <h2>Billing</h2>
          <div className={style.cohortPrice}>
            <h4>As a part of the {user.Cohort.name} cohort, your access to Boost is free until {moment(user.Cohort.endsAt).format('MM/DD/YYYY')}</h4>
            <h4>To switch to a personal plan, subscribe below.</h4>
          </div>
          <div className={style.prices}>
            <div className={style.priceCol}>
              <h3>Unlimited</h3>
              <span className={style.price}><strong>$59</strong> / month</span>
              <ul>
                <li>On-demand advice</li>
                <li>Personal coaching</li>
                <li>Fast response times</li>
                <li>"Boost" newsletter</li>
              </ul>
              <ButtonLink
                text={this.props.user.selectedPlan && this.props.user.hasConnectedBilling ? 'Subscribed' : 'Subscribe now'}
                className={this.props.user.selectedPlan && this.props.user.hasConnectedBilling ? style.selectedPlanButton : ''}
                disabled={this.props.form.get('updatePlanMutationInProgress') || (this.props.user.selectedPlan === 'achiever' && this.props.user.hasConnectedBilling)}
                loading={this.props.form.getIn(['achieverLoading'])}
                uppercase={true}
                onClick={this._onClickChangePlanAchiever}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={style.billingContainer}>
        <ConfirmModal
          isOpen={this.props.form.getIn(['showDeactiveAccountModal'])}
          heading='Are you sure you want to deactivate your account?'
          description='All of your topics will be removed, and are non-refundable. After deactivation, we will never charge your card again.'
          onClose={() => {
            this.props.setInForm(['showDeactiveAccountModal'], false);
          }}
          onConfirm={async () => {
            await this.props.userCancelPlan();
            this.props.setInForm(['showDeactiveAccountModal'], false);
          }}
        />
        <ConfirmModal
          isOpen={this.props.form.getIn(['showCouponModal'])}
          heading='Enter a coupon code'
          description={`This coupon will apply to your next month's charge`}
          confirmText='Submit code'
          loadingText='Submitting'
          confirmLoading={this.props.form.getIn(['couponMutationInProgress'])}
          input={{
            type: 'text',
            placeholder: 'Coupon code'
          }}
          onClose={() => {
            this.props.setInForm(['showCouponModal'], false);
          }}
          onConfirm={async (couponCode) => {
            await this.props.userAddCoupon(couponCode);
            this.props.setInForm(['showCouponModal'], false);
          }}
        />
        <Modal
          isOpen={this.props.form.getIn(['showCreditCardModal'])}
          className={style.paymentModal}
          onClose={() => {
            this.props.setInForm(['showCreditCardModal'], false);
          }}
        >
          <h2>Edit your credit card information</h2>
          { !this.props.user.hasConnectedBilling ? <p>Topics will be credited to your account and your card will be charged once your information is entered.</p> : null }
          <PaymentForm
            name='payment-form'
            onComplete={() => {
              this.props.setInForm(['showCreditCardModal'], false);
            }}
          />
        </Modal>
        <h2>Billing</h2>
        <div className={style.prices}>
          <div className={style.priceCol}>
            <h3>Unlimited</h3>
            <span className={style.price}><strong>$59</strong> / month</span>
            <ul>
              <li>On-demand advice</li>
              <li>Personal coaching</li>
              <li>Fast response times</li>
              <li>"Boost" newsletter</li>
            </ul>
            <ButtonLink
              text={this.props.user.selectedPlan && this.props.user.hasConnectedBilling ? 'Subscribed' : 'Subscribe now'}
              className={this.props.user.selectedPlan && this.props.user.hasConnectedBilling ? style.selectedPlanButton : ''}
              disabled={this.props.form.get('updatePlanMutationInProgress') || (this.props.user.selectedPlan === 'achiever' && this.props.user.hasConnectedBilling)}
              loading={this.props.form.getIn(['achieverLoading'])}
              uppercase={true}
              onClick={this._onClickChangePlanAchiever}
            />
          </div>
        </div>
        <Box className={style.box}>
          <h3>Card Information</h3>
          <div>
            <div className={style.cardInfo}>
              <div>
                <div className={style.cardInfoLabel}>
                  Status
                </div>
                <div className={style.cardInfoData}>
                  {this.props.user.hasConnectedBilling && this.props.user.selectedPlan ? (this.props.user.hasInvalidBilling ? 'There is an issue with your card!' : 'Connected') : 'Not connected'}
                </div>
              </div>
              {this.props.user.stripeCardLast4 ? <div>
                <div className={style.cardInfoLabel}>
                  Card
                </div>
                <div className={style.cardInfoData}>
                  XXXX XXXX XXXX {this.props.user.stripeCardLast4}
                </div>
              </div> : null}
            </div>
            <ButtonLink
              text={this.props.user.hasConnectedBilling ? 'Edit your credit card' : 'Add your credit card'}
              size='sm'
              className={style.changeCreditButton}
              onClick={() => {
                this.props.setInForm(['showCreditCardModal'], true);
              }}
            />
            { this.props.user.hasConnectedBilling && this.props.user.selectedPlan ? <ButtonLink
              text='Apply a coupon'
              size='sm'
              className={style.applyCouponButton}
              onClick={() => this.props.setInForm(['showCouponModal'], true)}
            /> : null}
          </div>
        </Box>
        { this.props.user && this.props.user.Transactions && this.props.user.Transactions.length ? <Box className={style.box}>
          <h3>Billing History</h3>
          <div>
            <div className={style.cardInfo}>
              {this.props.user.Transactions.map((t, i) => <div key={i}>
                <div className={style.cardInfoLabel}>
                  {moment(t.createdAt).format('MM/DD/YYYY')}
                </div>
                <div className={style.cardInfoData}>
                  Charged ${t.amount/100} to XXXX XXXX XXXX {t.cardLast4} ({t.status})
                </div>
              </div>)}
            </div>
          </div>
        </Box> : null }
        { this.props.user.selectedPlan ? (
          <Box className={style.box}>
            <h3>Deactivate Service</h3>
            <p>
              Clicking the button below will unsubscribe you from Boost entirely.
            </p>
            <ButtonLink
              background='gradientLight'
              text='Deactivate my account'
              size='sm'
              disabled={this.props.form.get('updatePlanMutationInProgress')}
              onClick={() => {
                this.props.setInForm(['showDeactiveAccountModal'], true);
              }}
            />
          </Box>
        ) : (
          <Box className={style.box}>
            <h3>To reactivate your service, select a plan above.</h3>
            <p>Your service is currently deactivated. If you select a payment plan above, you will be able to use Boost again immedietely.</p>
          </Box>
        )}
      </div>
    );
  }
}
