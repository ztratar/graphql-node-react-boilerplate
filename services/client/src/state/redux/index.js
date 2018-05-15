import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { createTracker } from 'redux-segment';
import { routerReducer, routerMiddleware, withRouter } from 'react-router-redux';
import Immutable from 'immutable';
import debug from 'debug';

import getApollo from '../apollo';

import appReducer from './reducers/app';
//import routingReducer from './reducers/routing';

import { setLoggedIn, setKiosk } from './actions/app/auth';

import { load as loadExperimentState } from './actions/app/experiment';

import defaultState from './default';

import {
  noopMiddleware,
  browserMiddleware,
  logMiddleware,
  cookieMiddleware,
  errorMiddleware,
  metaMiddleware
} from './middleware';

import { GRAPHQL_FQDN } from '../../../config/environment';

const log = debug('client:state:redux');

const getRootReducer = ({ apolloClient }) => combineReducers({
  apollo: apolloClient.reducer(),
  app: appReducer,
  routing: routerReducer // TODO: Replace with ImmutableJS reducer
});

const getMiddlewareStoreEnhancer = ({ apolloClient, ravenMiddleware, router }) => applyMiddleware(
  logMiddleware,
  cookieMiddleware({
    path: '/',
    disabled: !__CLIENT__
  }),
  browserMiddleware({
    disabled: !__CLIENT__
  }),
  __CLIENT__ ? metaMiddleware : noopMiddleware,
  __CLIENT__ ? createTracker() : noopMiddleware,
  ravenMiddleware || noopMiddleware,
  router,
  errorMiddleware,
  apolloClient.middleware()
);

export default ({
  initialState,
  headers,
  cookies = {},
  history,
  FQDN,
  ravenMiddleware
}) => {

  const { apolloClient, networkInterface } = getApollo({
    FQDN,
    headers,
    token: cookies.token
  });

  const router = routerMiddleware(history)

  const middlewareStoreEnhancer = getMiddlewareStoreEnhancer({
    apolloClient,
    router,
    ravenMiddleware
  });

  const storeEnhancer = __CLIENT__ ? compose(
    middlewareStoreEnhancer,
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ) : compose(
    middlewareStoreEnhancer
  );

  const rootReducer = getRootReducer({
    apolloClient
  });

  const store = createStore(
    rootReducer,
    {
      ...(initialState || defaultState),
      app: initialState ? Immutable.fromJS(initialState.app) : defaultState.app,
      routing: initialState ? initialState.routing : defaultState.routing
    },
    storeEnhancer
  );

  if (cookies.token) store.dispatch(setLoggedIn(cookies.token));

  if (!__CLIENT__) {
    // Only do this on the server, since doing it on the client after SSR would be superfluous
    log('reduce cookie experiment state into redux');
    Object.keys(cookies)
    .filter(key => /^AB_TEST_*/i.test(key))
    .forEach(key => {
      log(`reducing experiment ${key.replace('AB_TEST_', '')} with variation ${cookies[key]} into redux state`);
      store.dispatch(loadExperimentState(key.replace('AB_TEST_', ''), cookies[key]))
    });
  }

  networkInterface.applyMiddleware({
    store
  });

  return {
    apolloClient,
    store
  };
}
