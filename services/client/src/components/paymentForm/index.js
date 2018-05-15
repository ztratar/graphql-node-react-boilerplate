import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
import CardReactFormContainer from 'card-react';
import { autobind } from 'core-decorators';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import payment from 'payment';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import { add as addAlert } from 'state/redux/actions/app/alerts';
import {
  Form,
  Input
} from '../form';
import ButtonLink from '../buttonLink';
import analytics from '../../io/analytics';

import style from './index.css';

@graphql(gql`
  mutation userUpdateBilling ($input: UserUpdateBillingInput!) {
    user: userUpdateBilling (input: $input) {
      id
      selectedPlan
      hasConnectedBilling
      hasInvalidBilling
      stripeCardLast4
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
`, {
  props: ({
    mutate
  }) => ({
    updateStripePaymentInfo: async ({
      stripeCardName,
      stripeCardNumber,
      stripeCardExp,
      stripeCardCVC,
      couponCode
    }) => {
      try {
        analytics.track('USER_UPDATE_PAYMENT_INFORMATION');
        await mutate({
          variables: {
            input: {
              stripeCardName,
              stripeCardNumber,
              stripeCardExp,
              stripeCardCVC,
              couponCode
            }
          },
          updateQueries: {
            getBillingData: (previousResult, { mutationResult }) => {
              if (!mutationResult || !mutationResult.data || !mutationResult.data.user) {
                return previousResult;
              }

              return Object.assign({}, previousResult, {
                user: {
                  ...previousResult.user,
                  ...mutationResult.data.user
                }
              });
            }
          }
        });
        analytics.track('USER_UPDATE_PAYMENT_INFORMATION_SUCCESS');
      } catch (e) {
        analytics.track('USER_UPDATE_PAYMENT_INFORMATION_ERROR', {
          message: e.message
        });
        throw e;
      }
    }
  })
})
@connect(
  (state, props) => ({}),
  (dispatch, props) => ({
    actions: {
      addAlert: (opts) => dispatch(addAlert(opts))
    }
  })
)
@withStyles(style)
export default class PaymentForm extends PureComponent {
  static propTypes = {
    onComplete: PropTypes.func.isRequired,
    onError: PropTypes.func,
    className: PropTypes.string
  };

  static defaultProps = {
    onComplete: (d) => d,
    onError: (d) => d,
    className: ''
  };

  static formInputsNames = {
    number: 'number',
    expiry: 'expiry',
    cvc: 'cvc',
    name: 'name'
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      isHidden: true,
      submitLocked: false,
      couponCode: '',
      showCouponField: false,
      paymentFormId: 'payment-form-' + uuid.v4()
    };

    if (__CLIENT__) {
      const interval = setInterval(() => {
        if(document.readyState === 'complete') {
          clearInterval(interval);
          this.setState({
            isHidden: false
          });
        }
      }, 100);
    }
  }

  componentDidMount () {
    this.refs.card.refs['react-card-input-number'].refs.composedComponent.refs.input.focus();
  }

  get _formValues () {
    let stripeCardNumber = this.refs.card.refs['react-card-input-number'].refs.composedComponent.refs.input.value
      , stripeCardName = this.refs.card.refs['react-card-input-name'].refs.composedComponent.refs.input.value
      , stripeCardExp = this.refs.card.refs['react-card-input-expiry'].refs.composedComponent.refs.input.value
      , stripeCardCVC = this.refs.card.refs['react-card-input-cvc'].refs.composedComponent.refs.input.value;

    if (stripeCardName) {
      stripeCardName = stripeCardName.trim();
    }

    if (stripeCardNumber) {
      stripeCardNumber = stripeCardNumber.replace(/\s+/g, '');
    }

    if (stripeCardExp) {
      stripeCardExp = stripeCardExp.replace(/\s+/g, '');
    }

    if (stripeCardCVC) {
      stripeCardCVC = stripeCardCVC.replace(/\s+/g, '');
    }

    return {
      stripeCardName,
      stripeCardNumber,
      stripeCardExp,
      stripeCardCVC,
      couponCode: this.state.couponCode
    };
  }

  @autobind
  _onSubmit (e) {
    e.preventDefault();

    if (this.state.submitLocked) return;

    this.setState({
      submitLocked: true
    }, () => this.props.updateStripePaymentInfo(this._formValues)
      .then(() => {
        this.props.onComplete(this._formValues);
        this.setState({
          submitLocked: false
        });
        this.props.actions.addAlert({
          text: 'Credit card saved successfully!',
          color: '#11D79D',
          timeout: 3000
        });
      })
      .catch(e => {
        this.props.onError(e);
        this.setState({
          submitLocked: false
        });
        throw e;
      })
    );
  }

  @autobind
  _showCouponField () {
    this.setState({
      showCouponField: true
    });
  }

  render () {
    return (
      <div className={classNames(style.root, this.props.className)}>
        <div id={this.state.paymentFormId} className={classNames(style.cardWrapper, this.state.isHidden ? style.cardWrapperWithBg : '')}>
        </div>
        <div className={style.wrapper}>
          <CardReactFormContainer
            ref="card"
            container={this.state.paymentFormId}
            formInputsNames={PaymentForm.formInputsNames}
            className={style.outerWrapper}
            formatting={true}>
            <Form onSubmit={this._onSubmit}>
              <div className='row'>
                <div className={classNames('form-group', 'col-xs-12', style.formContainer)}>
                  <Input
                    className={classNames('form-control', style.input)}
                    placeholder="Card number"
                    name={PaymentForm.formInputsNames.number}
                    background='greyLightest'
                    disableFormStateControls={true}
                    focus
                    controlled={false}
                  />
                </div>
              </div>
              <div className='row'>
                <div className={classNames('form-group', 'col-xs-12', style.formContainer)}>
                  <Input
                    className={classNames('form-control', style.input)}
                    placeholder="Full name"
                    background='greyLightest'
                    name={PaymentForm.formInputsNames.name}
                    disableFormStateControls={true}
                    controlled={false}
                  />
                </div>
              </div>
              <div className='row'>
                <div className={classNames('form-group', 'col-xs-6', style.formContainer)}>
                  <Input
                    className={classNames('form-control', style.input)}
                    placeholder="MM/YY"
                    background='greyLightest'
                    name={PaymentForm.formInputsNames.expiry}
                    disableFormStateControls={true}
                    controlled={false}
                  />
                </div>
                <div className={classNames('form-group', 'col-xs-6', style.formContainer)}>
                  <Input
                    className={classNames('form-control', style.input)}
                    placeholder="CVC"
                    background='greyLightest'
                    name={PaymentForm.formInputsNames.cvc}
                    disableFormStateControls={true}
                    controlled={false}
                  />
                </div>
              </div>
              <div className='row'>
                { this.state.showCouponField ? (
                  <div className={classNames('form-group', 'col-xs-8', style.formContainer)}>
                    <Input
                      className={classNames('form-control', style.input)}
                      placeholder="Enter Coupon Code..."
                      background='greyLightest'
                      name='couponCode'
                      value={this.state.couponCode}
                      onChange={(val) => this.setState({ couponCode: val })}
                    />
                  </div>
                ) : <a href='#' className={style.addCouponCodeLink} onClick={this._showCouponField}>
                  + Add a coupon code
                </a> }
              </div>
              <ButtonLink
                className={style.button}
                type='submit'
                text={this.props.paymentButtonText || 'Submit Payment Information'}
                size='md'
                loading={this.state.submitLocked}
                loadingText='Submitting...'
              />
              {this.props.children ? this.props.children : null}
            </Form>
          </CardReactFormContainer>
        </div>
      </div>
    )
  }
}
