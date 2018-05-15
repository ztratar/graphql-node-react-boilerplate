import { CronJob } from 'cron';
import debug from 'debug';
import uuid from 'uuid';

import { captureException } from '../io/raven';
import { NODE_ENV } from '../../config/environment';
import { Exchange } from '../connectors/rabbitmq';
import DistLock, { AlreadyLockedError } from '../connectors/distLock';

const log = debug('graphql:workers:timer');

const timerLock = new DistLock(`/boost/locks/timer_${NODE_ENV.toLowerCase()}`, 10);

export const exchange = new Exchange('TIMER', Exchange.types.topic, {
  durable: true
});

export const exchangeConnected = exchange.assert();

export const MESSAGE_KEY = 'graphql.workers.timer_tick';

let ticker = null;

const onTick = async () => {
  try {
    const d = new Date();
    await timerLock.lock();
    log('won');
    log(`tick ${d.toISOString()}`);
    await exchange.publish(MESSAGE_KEY, {
      _id: uuid.v4().replace(/\W/g, ''),
      minute: d.getMinutes(),
      hour: d.getHours(),
      day_of_month: d.getDate(),
      day_of_week: d.getDay(),
      month: d.getMonth(),
      year: d.getFullYear(),
      iso: d.toISOString()
    });
    log('broadcasted tick successfully');
  } catch (e) {
    if (e instanceof AlreadyLockedError) {
      log('lost')
    } else {
      log('unknown exception');
      captureException(e);
    }
  }
}

const connect = async () => {
  if (ticker) return;
  await exchangeConnected;

  const cronTime = '*/1 * * * *';
  const start = true;

  ticker = new CronJob({
    cronTime,
    onTick,
    start
  });
};

export default connect;
