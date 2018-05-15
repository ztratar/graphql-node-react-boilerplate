import raven from 'raven-js';
import Promise from 'bluebird';
import debug from 'debug';

import {
  SENTRY_BROWSER_DSN,
  NODE_ENV
} from '../../config/environment';

const log = debug('client:io:raven_browser');

let opts = {
  environment: NODE_ENV,
  tags: {
    git_commit: __RELEASE_SHA__
  },
  autoBreadcrumbs: {
    xhr: true,
    console: false,
    dom: false,
    location: true
  },
  debug: true
};

if (__RELEASE_SHA__) opts.release = __RELEASE_SHA__;

raven.config(SENTRY_BROWSER_DSN, opts).install();

export const captureException = e => new Promise((resolve, reject) => {
  log('capturing exception %O', e);
  return raven.captureException(e, (err, id) => err ? resolve(null) : resolve(id));
})
.then(id => {
  log(`captured exception ${id}`);
  return id;
})
.catch(e => {
  log('error capturing exception %O', e);
  throw e;
});

export const setUserContext = user => raven.setUserContext({
  id: user.id,
  email: user.email,
  name: user.name,
  isExpert: !!user.Expert,
  isCustomer: !!user.Customer
});

export const captureBreadcrumb = data => raven.captureBreadcrumb(data);

export const context = fn => raven.context(fn);

window.addEventListener('unhandledrejection', e => captureException(e));

export default raven;
