import './io/raven';
import './io/statsd';
import '@risingstack/trace';

import Promise from 'bluebird';

import {
  ioConnectedPromise,
  app,
  server as httpServer
} from './io';

import workersConnected from './workers';

import { log, trace } from './io/logger';

import {
  HOSTNAME,
  PORT
} from '../config/environment';

import router from './router';
import connectSubscriptions from './io/subscription';

let r = router;

process.on('uncaughtException', (err) => trace('UncaughtException', err));
process.on('unhandledRejection', (err) => trace('unhandledRejection', err));

app.get('/health', (req, res) => healthy ? res.status(200).send({status: 'up'}) : res.status(503).send({status: 'down'}));

if (__DEV__) {
  if (module.hot) {
    log('[HMR] Waiting for server-side updates');

    module.hot.accept('./router', () => {
      r = require('./router').default;
    });

    module.hot.addStatusHandler((status) => {
      if (status === 'abort') {
        process.nextTick(() => process.exit(0));
      }
    });
  }
}

async function main () {
  try {
    app.use((req, res, next) => r(req, res, next));
    log('awaiting io connected state');
    await ioConnectedPromise;
    log('io connected');

    await workersConnected;
    log('workers connected');

    connectSubscriptions(httpServer);

    log(`GraphQL listening on ${HOSTNAME}:${PORT}`);


  } catch (e) {
    trace(e);
    process.exit(1);
  }
}

main();
