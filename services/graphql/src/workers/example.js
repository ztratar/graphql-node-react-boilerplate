import debug from 'debug';

import { captureException } from '../io/raven';
import { NODE_ENV } from '../../config/environment';
import { Queue } from '../connectors/rabbitmq';
import getModels from '../models'

import { exchangeConnected as timerExchangeConnected, exchange as timerExchange, MESSAGE_KEY } from './timer';

let modelsGet = getModels;
if (__DEV__) {
  if (module.hot) {
    module.hot.accept('../models', () => {
      modelsGet = require('../models').default;
    });
  }
}

// TODO: Change the "example_worker" to unique string for log namespace
const log = debug('graphql:workers:example_worker');

// TODO: Change the "EXAMPLE" to unique string for worker queue namespace
export const queue = new Queue(`EXAMPLE_WORKER_${NODE_ENV.toUpperCase()}`, {
  arguments: {
    messageTtl: 59000
  }
});

export const queueConnected = queue.assert()
  .then(() => timerExchangeConnected)
  .then(() => queue.bind(timerExchange, MESSAGE_KEY));

const subscriber = async (message) => {
  try {
    const { minute, iso } = message.data;

    // Run every hour on the hour
    if (minute !== 0) {
      log('skipping tick');
      await message.ack();
      return;
    }

    log('executing');

    //
    // TODO: ADD WORKER LOGIC HERE
    //
    // var foo = 'bar';
    //

    log('complete');

    await message.ack();

    log('successfully executed');
  } catch (e) {
    log('failed to succesfully execute');
    captureException(e);
    await message.nack();
  }
};

const connect = async () => {
  log('connecting worker');
  await queueConnected;
  await queue.subscribe(subscriber)
  log('worker connected');
};

export default connect;
