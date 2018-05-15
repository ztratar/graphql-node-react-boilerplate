import { makeExecutableSchema } from 'graphql-tools';
import OpticsAgent from 'optics-agent';

import Resolvers, { userResolver as UserResolver } from './resolvers/index';
import TypeDefs from './schemas/index';
import { logger } from './io';

let resolvers =  Resolvers;
let userResolver = UserResolver;
let typeDefs = TypeDefs;

if (__DEV__) {
  if (module.hot) {
    module.hot.accept('./resolvers/index', () => {
      const p = require('./resolvers/index');
      resolvers = p.default;
      userResolver = p.userResolver;
    });
    module.hot.accept('./schemas/index', () => {
      typeDefs = require('./schemas/index').default;
    });
  }
}

const allowUndefinedInResolve = true;

const resolverValidationOptions = {
  requireResolversForArgs: true,
  requireResolversForNonScalar: false
};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
  allowUndefinedInResolve,
  logger,
  resolverValidationOptions
});

let finalSchema = null;

if (__PRODUCTION__) {
  finalSchema = OpticsAgent.instrumentSchema(executableSchema);
}

const schema = () => finalSchema || executableSchema;

export default schema;
