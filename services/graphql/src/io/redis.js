import redis from 'redis';
import Promise from 'bluebird';
import debug from 'debug';

import {
  REDIS_URL,
  NODE_ENV
} from '../../config/environment';

const log = debug('graphql:io:redis');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let handled = false;

log(`connecting to redis at ${REDIS_URL}`);

const connection = redis.createClient(REDIS_URL, {
  prefix: `graphql_${NODE_ENV.toLowerCase()}`,
  enable_offline_queue: false
});

export default connection;

export const connectionPromise = new Promise((resolve, reject) => {
  connection.on('ready', () => {
    if (!handled) {
      log(`redis connection ready`);
      handled = true;
      return resolve(connection);
    }
  });
  connection.on('error', (e) => {
    if (!handled) {
      log(`redis connection error`);
      handled = true;
      return reject(e);
    }
  });
});
