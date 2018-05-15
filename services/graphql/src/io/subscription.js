import { SubscriptionManager } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import url from 'url';
import debug from 'debug';

import schema from '../schema';
import getModels from '../models';
import { tokenToObject } from '../lib/crypto';
import pubsub from './pubsub';
import { setupFunctions } from '../resolvers';

const log = debug('graphql:io:subscription');

let modelsGet = getModels;

const subscriptionManager = new SubscriptionManager({
  schema: schema(),
  pubsub,
  setupFunctions
});

let server = null;

if (__DEV__) {
  if (module.hot) {
    module.hot.accept('../models', () => {
      modelsGet = require('../models').default;
    });
  }
}

const onSubscribe = async (msg, params, req) => {
  const { operationName, variables = {}, context: { user } } = params;
  log('user "%s" subscribing to "%s" with variables %O', user.id, operationName, variables);
  return {
    ...params,
    context: {
      user: params.context.user,
      models: await getModels(params.context.user)
    }
  };
};

export default (httpServer) => {
  if (!server) {
    server = new SubscriptionServer({
      subscriptionManager,
      onSubscribe,
      onConnect: async (connectionParams, ws) => {
        const { token } = connectionParams;

        let id = null
          , User = null
          , user = null;

        log('client attempting to establish ws connection');

        if (!token) {
          log('token not included.  rejecting ws connection');
          return false;
        }

        try {
          log('converting token to object');
          const obj = await tokenToObject(token);
          id = obj.id;
        } catch (e) {
          log('token invalid.  rejecting ws connection');
          return false;
        }

        try {
          log('getting models');
          const models = await modelsGet({});
          User = models.User;
        } catch (e) {
          log('could not load models.  rejecting ws connection');
          return false;
        }

        log('finding user "%s"', id);

        user = await User.findById(id);

        if (!user) {
          log('user "%s" could not be found.  rejecting ws connection', id);
          return false;
        }

        log('user "%s" connecting', user.id);

        return {
          user
        };
      }
    }, {
      server: httpServer
    });
  }
};
