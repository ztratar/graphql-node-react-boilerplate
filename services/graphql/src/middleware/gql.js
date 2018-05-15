import { graphqlExpress } from 'graphql-server-express';
import { GraphQLError } from 'graphql';
import { formatError } from 'apollo-errors';
import { increment } from '../io/statsd';
import { captureException } from '../io/raven';

import { NODE_ENV } from '../../config/environment';
import { UnknownError } from '../errors/internal';
import schema from '../schema';

const middleware = graphqlExpress((req, res) => {

  let { context } = req;

  context.ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

  return {
    schema: schema(),
    formatError: error => {
      let e = formatError(error);

      if (e instanceof GraphQLError) {
        increment('errors.uncaught');

        captureException(e);

        if (NODE_ENV !== 'development') {
          e = formatError(new UnknownError({
            data: {
              originalMessage: e.message,
              originalError: e.name
            }
          }));
        }
      }

      return e;
    },
    context
  };
});

export default middleware;
