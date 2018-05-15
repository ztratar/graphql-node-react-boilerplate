import { inject } from 'injectorator';
import Promise from 'bluebird';
import stripe from 'stripe';
import debug from 'debug';
import { isObject } from 'underscore';

import BaseStripeConnector from './base';

import {
  STRIPE_CLIENT_SECRET
} from '../../../config/environment';

const log = debug('graphql:connectors:stripe:charge');

const client = stripe(STRIPE_CLIENT_SECRET);

const createCharge = (chargeData = {}) => new Promise((resolve, reject) => (
  client.charges.create(chargeData, (err, charge) => err ? reject(err) : resolve(charge))
));

const listCharges = (customerId = 'noop', limit, starting_after) => new Promise((resolve, reject) => client.charges.list({
  customer: customerId,
  limit,
  starting_after
}, (err, charges) => err ? reject(err) : resolve(charges)));

@inject({
  Promise: () => Promise
})
export default class StripeChargeConnector extends BaseStripeConnector {
  constructor ({
    Promise
  }) {
    super();

    this._Promise = Promise;
  }

  async create ({
    stripeChargeAmount,
    stripeChargeDescription,
    stripeCustomerId,
    metadata = {}
  }) {
    const currency = 'usd';
    const customer = stripeCustomerId;
    const description = stripeChargeDescription;

    console.log('----');
    console.log('test', stripeChargeAmount, stripeChargeDescription);
    console.log('----');

    log(`creating change in amount of ${stripeChargeAmount} from stripe customer ${customer} with description ${description}`);

    try {
      const {
        id,
        amount,
        paid,
        status,
        created: createdAt,
        source: {
          last4: cardLast4,
          exp_month: cardExpMonth,
          exp_year: cardExpYear
        }
      } = await createCharge({
        amount: stripeChargeAmount,
        currency,
        customer,
        description,
        metadata
      });

      log(`CHARGE SUCCESS!  Returning`);

      return {
        id,
        amount,
        paid,
        status,
        createdAt: new Date(createdAt * 1000).toISOString(),
        cardLast4,
        cardExpMonth,
        cardExpYear
      };
    } catch (e) {
      log(`CHARGE FAILURE! :(`);
      console.trace(e);
      throw e;
    }
  }

  async list (customerId, limit, after) {
    let charges = await listCharges(customerId, limit, after);

    if (!charges.data) charges = { data: [] };

    return charges.data.map(({
      id,
      amount,
      paid,
      status,
      created: createdAt,
      source: {
        last4: cardLast4,
        exp_month: cardExpMonth,
        exp_year: cardExpYear
      }
    }) => ({
      id,
      amount,
      paid,
      status,
      createdAt: new Date(createdAt * 1000).toISOString(),
      cardLast4,
      cardExpMonth,
      cardExpYear
    }));
  }
}
