import { inject } from 'injectorator';
import Promise from 'bluebird';
import stripe from 'stripe';
import debug from 'debug';
import { isObject } from 'underscore';

import BaseStripeConnector from './base';

import {
  STRIPE_CLIENT_SECRET
} from '../../../config/environment';

const log = debug('graphql:connectors:stripe:customer');

const client = stripe(STRIPE_CLIENT_SECRET);

const createCustomer = ({
  description,
  email,
  userId
}, {
  name,
  number,
  exp_month,
  exp_year,
  cvc
}) => new Promise((resolve, reject) => client.customers.create({
  source: {
    name,
    number,
    exp_month,
    exp_year,
    cvc,
    object: 'card'
  },
  description,
  email,
  metadata: {
    userId
  }
}, (err, customer) => err ? reject(err) : resolve(customer)));

const updateCustomer = (customerId, {
  name,
  number,
  exp_month,
  exp_year,
  cvc
}) => new Promise((resolve, reject) => client.customers.update(customerId, {
  source: {
    name,
    number,
    exp_month,
    exp_year,
    cvc,
    object: 'card'
  }
}, (err, customer) => err ? reject(err) : resolve(customer)));

@inject({
  Promise: () => Promise
})
export default class StripeCustomerConnector extends BaseStripeConnector {
  constructor ({
    Promise
  }) {
    super();

    this._Promise = Promise;
  }

  async create ({
    name: description,
    email,
    userId
  }, {
    name,
    number,
    exp_month,
    exp_year,
    cvc
  }) {
    const customer = await createCustomer({
      description,
      email,
      userId
    }, {
      name,
      number,
      exp_month,
      exp_year,
      cvc
    });

    return {
      id: customer.id
    }
  }

  async update (customerId, {
    name,
    number,
    exp_month,
    exp_year,
    cvc
  }) {
    const customer = await updateCustomer(customerId, {
      name,
      number,
      exp_month,
      exp_year,
      cvc
    });

    return {
      id: customer.id
    };
  }
}
