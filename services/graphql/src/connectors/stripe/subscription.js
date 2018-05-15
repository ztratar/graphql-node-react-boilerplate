import { inject } from 'injectorator';
import Promise from 'bluebird';
import stripe from 'stripe';
import debug from 'debug';
import { isObject } from 'underscore';

import BaseStripeConnector from './base';

import {
  STRIPE_CLIENT_SECRET
} from '../../../config/environment';

const log = debug('graphql:connectors:stripe:subscription');

const client = stripe(STRIPE_CLIENT_SECRET);

const isUpgrade = (newPlan, oldPlan) => {
  if (oldPlan === newPlan) return false;
  if (oldPlan === 'influencer') return false;
  if (oldPlan === 'performer') return true;
  if (oldPlan === 'achiever' && newPlan === 'influencer') {
    return true;
  } else {
    return false;
  }
};

const createSubscription = ({ customerId, planId, couponCode }) => new Promise(
  (resolve, reject) => client.subscriptions.create({
    customer: customerId,
    plan: planId,
    coupon: couponCode ? couponCode : undefined
  }, (err, subscription) => err ? reject(err) : resolve(subscription))
);

const updateSubscription = ({ customerId, subscriptionId, oldPlanId, planId, couponCode }) => new Promise(
  (resolve, reject) => client.subscriptions.update(subscriptionId, {
    plan: planId,
    prorate: isUpgrade(planId, oldPlanId),
    coupon: couponCode ? couponCode : undefined
  }, async (err, subscription) => {
    if (err) return reject(err);

    // In the case of a plan upgrade, we need to generate
    // the invoice right away, so their card is charged.
    if (isUpgrade(planId, oldPlanId)) {
      client.invoices.create({
        customer: customerId,
        subscription: subscriptionId
      }, (err, invoice) => {
        if (err) return reject(err);

        client.invoices.pay(invoice.id, (err, inboice) => {
          if (err) return reject(err);
          resolve(subscription);
        });
      });
      return;
    }

    return resolve(subscription);
  })
);

const applyCouponToSubscription = ({ subscriptionId, couponId }) => new Promise(
  async (resolve, reject) => {
    // Check to see if coupon is valid
    return client.coupons.retrieve(couponId, (err, coupon) => {
      if (err) return reject(err);

      // Check to see if subscription is valid
      return client.subscriptions.retrieve(subscriptionId, async (err, subscription) => {
        if (err) return reject(err);

        // Apply coupon to subscription
        return client.subscriptions.update(subscriptionId, {
          coupon: coupon.id
        }, async (err, subscription) => {
          if (err) return reject(err);
          return resolve(subscription);
        });
      });
    });
  }
);

const destroySubscription = ({ subscriptionId }) => new Promise(
  (resolve, reject) => client.subscriptions.del(
    subscriptionId,
    (err, subscription) => err ? reject(err) : resolve(subscription)
  )
);

@inject({
  Promise: () => Promise
})
export default class StripeSubscriptionConnector extends BaseStripeConnector {
  constructor ({
    Promise
  }) {
    super();

    this._Promise = Promise;
  }

  async create ({
    customerId,
    planId,
    couponCode
  }) {
    const {
      id
    } = await createSubscription({
      customerId,
      planId,
      couponCode
    });

    return {
      id
    };
  }

  async update ({
    customerId,
    subscriptionId,
    oldPlanId,
    planId,
    couponCode
  }) {
    const { id } = await updateSubscription({
      customerId,
      subscriptionId,
      oldPlanId,
      planId,
      couponCode
    });

    return {
      id
    };
  }

  async applyCouponToSubscription({
    subscriptionId,
    couponId
  }) {
    const { id } = await applyCouponToSubscription({
      subscriptionId,
      couponId
    });

    return {
      id
    };
  }

  async destroy ({
    subscriptionId
  }) {
    const { id } = await destroySubscription({
      subscriptionId
    });

    return {
      id
    };
  }
}
