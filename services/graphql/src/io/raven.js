import raven from 'raven';
import Promise from 'bluebird';
import { isInstance } from 'apollo-errors';

import {
  SENTRY_DSN,
  NODE_ENV
} from '../../config/environment';

let opts = {
  environment: NODE_ENV,
  tags: {
    git_commit: __RELEASE_SHA__
  },
  debug: true
};

if (__RELEASE_SHA__) opts.release = __RELEASE_SHA__;

raven.config(SENTRY_DSN, opts).install();

export const captureException = (e, user = null) => new Promise((resolve, reject) => {
  if (__TEST__ && isInstance(e)) {
    return resolve();
  }
  console.trace(e);
  return user ? raven.context(() => {
    raven.setContext({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isExpert: !!user.Expert,
        isCustomer: !!user.Customer
      }
    });
    raven.captureException(e, (err, id) => err ? resolve(null) : resolve(id))
  }) : raven.captureException(e, (err, id) => err ? resolve(null) : resolve(id))
});

export const context = fn => raven.context(fn);

process.on('uncaughtException', (e) => captureException(e));
process.on('unhandledRejection', (e) => captureException(e));

export default raven;
