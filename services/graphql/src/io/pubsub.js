import { RedisPubSub } from 'graphql-redis-subscriptions';

import {
  REDIS_URL,
  NODE_ENV
} from '../../config/environment';

const options = {
  connection: {
    url: REDIS_URL,
    prefix: `graphql-pubsub-${NODE_ENV.toLowerCase()}`,
    enable_offline_queue: false
  }
};

const pubsub = new RedisPubSub(options);

export default pubsub;
