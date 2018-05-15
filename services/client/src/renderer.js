import React from 'react';
import Promise from 'bluebird';
import debug from 'debug';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import { match, RouterContext, createMemoryHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactDOMServer from 'react-dom/server';
import gql from 'graphql-tag';

import matchAsync from './lib/matchAsync';
import userFragment from './fragments/user';
import { add as addAlert } from './state/redux/actions/app/alerts';
import { noAppAccess } from './state/redux/actions/app/auth';
import getStore from './state/redux';
import { trace } from 'io/logger';
import { captureException } from 'io/raven-node';
import routesFactory from 'routes';
import Html from 'components/common/html';
import StatusPageContainer from './containers/statusPageContainer';

import { set as setFQDN } from './state/redux/actions/app/fqdn';
import { set as setMeta } from './state/redux/actions/app/meta';

import { GRAPHQL_FQDN, FORCE_STATUS_PAGE } from '../config/environment';

const log = debug('client:renderer');

function checkEffects (req, res, store) {
  const location = req.originalUrl;

  const initialState = store.getState();

  const { routing: { locationBeforeTransitions: { pathname, search } } } = initialState;

  const finalLocation = `${pathname}${search}`;

  const tokenRemoved = req.cookies.token && !store.getState().app.getIn(['auth', 'token']);

  if (tokenRemoved) {
    log(`clearing token cookie due programmatic removal`);
    res.clearCookie('token');
  }

  if (location !== finalLocation || tokenRemoved) {
    log(`redirecting to ${finalLocation} due to programmatic redirect OR token removal (${location} == ${finalLocation} || !${tokenRemoved})`);
    res.redirect(finalLocation);
    return true;
  }
  return false;
}

export default async function render (req, res, next) {
  try {
    const location = req.originalUrl;

    console.log()

    log('rendering route', location);

    const memoryHistory = createMemoryHistory(location);

    const { store, apolloClient: client } = getStore({
      FQDN: GRAPHQL_FQDN,
      cookies: req.cookies,
      headers: req.headers,
      history: memoryHistory
    });

    log('fetching the user');

    let { data: { user } } = await client.query({
      query: gql`
        query checkAccess {
          user: getMyUser {
            ...UserFragment
          }
        }
        ${userFragment}
      `
    });

    if (req.query.redirect_token) {
      try {
        const response = await client.mutate({
          mutation: gql`
            mutation userExchangeRedirectToken ($input: UserExchangeRedirectTokenInput!) {
              user: userExchangeRedirectToken (input: $input) {
                ...UserFragment
                token
              }
            }
            ${userFragment}
          `,
          variables: {
            input: {
              redirectToken: req.query.redirect_token
            }
          }
        });

        user = response.data.user;

        res.cookie('token', user.token);

        log('user after exchange: %O', user);

        return res.redirect(req.path);

      } catch (e) {
        log('issue exchanging redirect token', e);
        // Note: Only redirect the user if the redirect token wasn't valid AND the user didn't already have a token
        if (!user) {
          log('redirecting the unauthenticated user whose redirect token failed in exchange')
          return res.redirect(`/login?alert=${encodeURIComponent('There was an issue redirecting you to the site.  Please try logging in')}`);
        }
      }
    }

    if (user) {
      req.user = user;
      log(`request by user ${user.id}`);
    } else {
      log('request by anonymous user');
    }

    const isAdmin = user && user.isAdmin;

    // NOTE: Hack to prevent access while we finish the app
    // if (!isAdmin) store.dispatch(noAppAccess());

    if (isAdmin) {
      log(`user ${user.id} is an admin`);
    } else {
      log(`user${user ? ` ${user.id}` : ''} is not an admin`);
    }

    if (!isAdmin && (!user || !user.signupComplete)) {
      log('dispatching noAppAccess');
      store.dispatch(noAppAccess());
    }

    if (req.query.alert) {
      log(`adding alert from query %O`, {
        text: req.query.alert,
        color: req.query.alert_color || undefined
      });
      store.dispatch(addAlert({
        text: req.query.alert,
        color: req.query.alert_color || undefined
      }));
    }

    log('getting routes');

    const { renderContext, routes } = routesFactory(store, user);

    log('getting history');

    const history = syncHistoryWithStore(memoryHistory, store);

    log(`matching route ${location}`);

    const { redirectLocation, renderProps } = await matchAsync({ history, routes, location });

    log(`matched route ${location}`);

    if (redirectLocation) {
      log(`redirecting to ${redirectLocation.pathname + redirectLocation.search} due to unknown route`)
      return res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else {
      log(`route ${location} valid, no redirect required`);
    }

    const root = (
      <ApolloProvider store={store} client={client}>
        <RouterContext {...renderProps} />
      </ApolloProvider>
    );

    log('getting data from tree');

    await getDataFromTree(root);

    const protocol = __DEV__ ? 'http' : 'https';

    log(`dispatching FQDN to store ${protocol}://${req.get('origin') || req.get('host')}`);

    store.dispatch(setFQDN(`${protocol}://${req.get('origin') || req.get('host')}`));

    if (checkEffects(req, res, store)) {
      log('effects-based redirect applied, returning from render method');
      return;
    }

    log('getting content string');
    const content = ReactDOMServer.renderToString(root);

    log('getting initial state');
    const initialState = store.getState();

    log('processing new experiments');
    // Get new experiment set
    const newExperiments = Object.keys(initialState.app.get('experiment').toJSON());

    log('persisting new experients to cookies')
    // Persist new experiment set in cookies
    newExperiments.forEach(key => {
      const cookieKey = `AB_TEST_${key}`;
      log(`setting experiment cookie ${cookieKey} to ${initialState.app.getIn(['experiment', key])}`);
      res.cookie(cookieKey, initialState.app.getIn(['experiment', key]))
    });

    log('getting existing experiments');
    // Get existing experiment set
    const existingExperiments = Object.keys(req.cookies)
    .filter(key => /^AB_TEST_*/i.test(key))
    .map(key => key.replace('AB_TEST_', ''));

    log('clearing existing experiment cookies that are no longer in use');
    // Clear cookies not in new experiment set
    const newExperimentsHash = newExperiments.reduce((hash, key) => ({
      ...hash,
      [key]: true
    }), {});
    existingExperiments.filter(key => !newExperimentsHash[key]).forEach(key => {
      const cookieKey = `AB_TEST_${key}`;
      log(`clearing existing experiment cookie key ${cookieKey}`);
      res.clearCookie(cookieKey);
    });

    log('running experiments %O', initialState.app.get('experiment').toJSON());

    const { routing: { locationBeforeTransitions: { pathname, search } } } = initialState;

    const finalLocation = `${pathname}${search}`;

    log('creating html component');

    const html = (
      <Html
        content={content}
        state={store.getState()}
        url={initialState.app.get('fqdn') + finalLocation}
        style={__PRODUCTION__ ? renderContext.getCssString() : ''}
        {...initialState.app.get('meta').toJSON()}
      />
    );

    log('creating final markup');

    const markup = `<!doctype html>\n${ReactDOMServer.renderToString(html)}`;

    log('returning final markup');

    log('final experiments %O', initialState.app.get('experiment').toJSON());

    res.status(200).send(markup);

  } catch (e) {
    captureException(e, req.user);
    next(e);
  }
}
