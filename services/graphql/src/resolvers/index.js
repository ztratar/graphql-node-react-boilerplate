import debug from 'debug';

import combineResolvers from '../lib/combineResolvers';

import {
  ForbiddenError
} from '../errors/functional';

import scalarResolver from './_scalar';

import locationResolver from './location';
import topicResolver from './topic';
import userResolver from './user';
import postResolver from './post';
import fileResolver from './file';

const resolvers = combineResolvers([
  // General
  scalarResolver,

  // Type specific
  locationResolver,
  topicResolver,
  userResolver,
  postResolver,
  fileResolver
]);

const log = debug('graphql:resolvers');

export const setupFunctions = {
  userSubscription: ({ context: { user }}, { input: { UserId } }) => {
    if (UserId && !user.isAdmin) throw new ForbiddenError();

    UserId = UserId || user.id;

    log('user "%s" subscribing to userSubscription for user "%s"', user.id, UserId);

    return {
      userChannel: {
        filter: user => user.id === UserId
      }
    };
  }
};

export default resolvers;
