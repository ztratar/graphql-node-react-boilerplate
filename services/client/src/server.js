import fetch from 'isomorphic-fetch'; // Polyfill global fetch
import https from 'https';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import debug from 'debug';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { Z_BEST_COMPRESSION } from 'zlib';

import { trace } from 'io/logger';

import { redirectTokenToObject } from './lib/crypto';

import renderer from 'renderer';

import StatusPageContainer from 'containers/statusPageContainer';

import raven from 'io/raven-node';

import { NODE_ENV, FORCE_STATUS_PAGE, PORT, HOSTNAME } from '../config/environment';

export const ravenRequestHandler = raven.requestHandler();

export const ravenErrorHandler = raven.errorHandler();

const log = debug('client:server');

let r = renderer;

let healthy = false;

const app = express();

// This must be the first piece of middleware
app.use(ravenRequestHandler);

app.get('/health', (req, res) => healthy ? res.status(200).send({status: 'up'}) : res.status(503).send({status: 'down'}));

if (NODE_ENV !== 'development') {
  app.use(compression({
    level: Z_BEST_COMPRESSION
  }));
  app.use(express.static('dist'));
}

app.use(cookieParser());

app.use((req, res, next) => {
  if (req.query.token) {
    res.cookie('token', req.query.token);
    req.cookies.token = req.query.token;
  }
  next();
});

const forceStatusPageError = new Error('Forcing Status Page');

app.use(async (req, res, next) => {
  if (!req.query.redirect_token) {
    return next();
  }
  try {
    req.redirectToken = await redirectTokenToObject(req.query.redirect_token);
    log('redirect token "%s": %O', req.query.redirect_token, req.redirectToken);
    next();
  } catch (e) {
    log('error decrypting redirect token "%s"', req.query.redirect_token, e);
    req.redirectToken = null;
    next();
  }
});

app.get('/*', (req, res, next) => {
  if (FORCE_STATUS_PAGE) {
    log('forcing status page due to environment variable');
    throw forceStatusPageError;
  }
  r(req, res, next);
});

app.listen(PORT, () => {
  log(`listening at ${HOSTNAME}:${PORT}`);
  healthy = true;
});

if (__DEV__) {
  if (module.hot) {
    log('[HMR] Waiting for server-side updates');

    module.hot.accept('renderer.js', () => {
      r = require('renderer.js').default;
    });

    module.hot.addStatusHandler((status) => {
      if (status === 'abort') {
        process.nextTick(() => process.exit(0));
      }
    });
  }
}

//  This must be the first piece of error middleware
app.use((err, req, res, next) => {
  if (err !== forceStatusPageError) {
    log('sending error to raven %O', err);
    return ravenErrorHandler(err, req, res, next);
  }
  return next(err);
});

app.use((err, req, res, next) => {
  trace(err);
  log('returning status page container due to error');
  const markup = `<!doctype html>\n${ReactDOMServer.renderToString((
    <StatusPageContainer/>
  ))}`;
  res.status(500).send(markup);
});
