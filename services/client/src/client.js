import fetch from 'isomorphic-fetch'; // Polyfill global fetch
import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import routesFactory from 'routes';
import { Router, match, browserHistory } from 'react-router';
import { syncHistoryWithStore, push } from 'react-router-redux';
import cookie from 'react-cookie';
import gql from 'graphql-tag';

import userFragment from 'fragments/user';
import { setUserContext } from 'io/raven-browser';
import getStore from './state/redux';
import { setIdentified } from './state/redux/actions/app/auth';
import { rendered } from './state/redux/actions/app/rendered';
import { log } from './io/logger'
import analytics from './io/analytics';
import installRepl from './repl';
import ravenMiddleware from 'state/redux/middleware/raven';

import reload from './lib/reload';

const { INITIAL_STATE, ROOT_ID, BROWSER_GRAPHQL_FQDN } = window.cfg;

const { store, apolloClient: client } = getStore({
  FQDN: BROWSER_GRAPHQL_FQDN,
  cookies: cookie.select() || {},
  initialState: INITIAL_STATE,
  history: browserHistory,
  ravenMiddleware
});

installRepl({
  store,
  client
});

const history = syncHistoryWithStore(browserHistory, store);


client.query({
  query: gql`
    query checkAccess {
      user: getMyUser {
        ...UserFragment
      }
    }
    ${userFragment}
  `
}).then(({ data: { user } }) => {
  if (user) {
    store.dispatch(setIdentified(user));
    setUserContext({
      ...user
    });
  }

  const { routes } = routesFactory(store, user);

  match({ history, routes }, (err, redirectLocation, renderProps) => {
    log('beginning initial render');
    render((
      <ApolloProvider store={store} client={client}>
        <Router
          onUpdate={(a,b,c) => {
            window.scrollTo(0, 0);
            analytics.page();
          }}
          {...renderProps}
        />
      </ApolloProvider>
    ), document.getElementById(ROOT_ID), () => {
      log('initial render complete');
      store.dispatch(rendered());
    });
  });
});
