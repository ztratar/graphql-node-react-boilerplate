import amqp from 'amqplib';
import debug from 'debug';
import Promise from 'bluebird';
import { parse } from 'url';

import {
  RABBITMQ_URL
} from '../../config/environment';

const log = debug('graphql:io:rabbitmq');

const handleConnectionError = e => {
  log('rabbitmq connection error');
  console.trace(e);
  process.exit(1);
};

log(`connecting to rabbitmq at ${RABBITMQ_URL}`);

const { hostname: servername } = parse(RABBITMQ_URL);

export const connectedPromise = amqp.connect(RABBITMQ_URL, {
  servername
}).then((conn, err) => {
  if (err) return handleConnectionError(err);
  conn.on('close', handleConnectionError);
  conn.on('error', handleConnectionError);
  return conn.createChannel();
}).then(chan => {
  log(`connected to rabbitmq at ${RABBITMQ_URL}`);
  return chan;
});
