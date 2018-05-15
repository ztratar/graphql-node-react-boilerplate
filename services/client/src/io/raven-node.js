import raven from 'raven';
import Promise from 'bluebird';
import debug from 'debug';

import {
  SENTRY_NODE_DSN,
  NODE_ENV
} from '../../config/environment';

const log = debug('client:io:raven_node');

let opts = {
  environment: NODE_ENV,
  tags: {
    git_commit: __RELEASE_SHA__
  },
  debug: true
};

if (__RELEASE_SHA__) opts.release = __RELEASE_SHA__;

raven.config(SENTRY_NODE_DSN, opts).install();

export const captureException = (e, user = null) => new Promise((resolve, reject) => {
  log('capturing exception %O', e);
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
}).then(id => {
  log(`captured exception ${id}`);
  return id;
})
.catch(e => {
  log('error capturing exception %O', e);
  throw e;
})

export const context = fn => raven.context(fn);

process.on('uncaughtException', (e) => captureException(e));
process.on('unhandledRejection', (e) => captureException(e));

export default raven;
