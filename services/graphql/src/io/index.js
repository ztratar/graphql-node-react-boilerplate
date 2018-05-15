import Promise from 'bluebird';

import * as logger from './logger';
import redisConnection, { connectionPromise as redisConnectionPromise } from './redis';
import { listen as httpListen, app, server } from './http';
import { connectionPromise as rabbitMQConnectionPromise } from './rabbitmq';

const ioConnectedPromise = Promise.all([
  redisConnectionPromise,
  rabbitMQConnectionPromise
])
.then(() => Promise.all([
  httpListen
]));

export {
  ioConnectedPromise,
  redisConnection,
  logger,
  app,
  server
};
