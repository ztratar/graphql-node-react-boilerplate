import Promise from 'bluebird';
import Sequelize from 'sequelize';
import debug from 'debug';
import { isInstance } from 'apollo-errors';

import { captureException } from '../io/raven';
import sequelize from '../io/postgres';

const log = debug('graphql:functions:transaction_context');

export class TransactionContext {
  constructor (transaction, result) {
    this._transaction = transaction;
    this._result = result;
    this._result.catch((e) => {
      if (!isInstance(e)) {
        captureException(e);
      }
      throw e;
    });
  }
  get transaction () {
    return this._transaction;
  }
  after () {
    return new Promise((resolve, reject) => {
      this._result.then(
        () => resolve(),
        (e) => {
          reject(e);
          throw e;
        }
      );
    });
  }
}


export const createTransactionContext = fn => {
  const result = sequelize.transaction({
    deferrable: Sequelize.Deferrable.SET_DEFERRED
  }, (t) => {
    const transactionContext = new TransactionContext(t, result);
    return Promise.resolve(fn(transactionContext));
  });
  return result;
};
