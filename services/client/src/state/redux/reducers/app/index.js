import Immutable from 'immutable';

import auth from './auth';
import form from './form';
import browser from './browser';
import alerts from './alerts';
import fqdn from './fqdn';
import meta from './meta';
import rendered from './rendered';
import experiment from './experiment';

import defaultState from '../../default';

export default (prevState = defaultState.app, action) => prevState
  .merge({
    auth: auth(prevState.get('auth'), action),
    form: form(prevState.get('form'), action),
    browser: browser(prevState.get('browser'), action),
    alerts: alerts(prevState.get('alerts'), action),
    fqdn: fqdn(prevState.get('fqdn'), action),
    meta: meta(prevState.get('meta'), action),
    rendered: rendered(prevState.get('rendered'), action),
    experiment: experiment(prevState.get('experiment'), action)
  });
