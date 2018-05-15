import { isInstance } from 'apollo-errors';

import { increment } from '../io/statsd';
import { trace } from '../io/logger';
import {
  AlreadyAuthenticatedError,
  NotAuthenticatedError,
  NotAuthorizedError,
  AdminRequiredError,
  CustomerRequiresValidBillingError
} from '../errors/functional';
import { UnknownError } from '../errors/internal';

import createResolver from '../lib/createResolver';

export const baseResolver = createResolver(
  null,
  (root, args, context, err) => {
    if (!isInstance(err)) {
      increment('errors.uncaught');
      trace('masking internal error', err);
      return new UnknownError();
    }
    return err;
  }
);

export const isAuthenticatedResolver = baseResolver.createResolver(
  (root, args, context) => {
    if (!context.user || !context.user.id) {
      throw new NotAuthenticatedError();
    }
  }
);

export const isNotAuthenticatedResolver = baseResolver.createResolver(
  (root, args, context) => {
    if (context.user && context.user.id) {
      throw new AlreadyAuthenticatedError();
    }
  }
);

export const isAdminResolver = baseResolver.createResolver(
  (root, args, context) => {
    if (!context.user || !context.user.isAdmin) throw new AdminRequiredError();
  }
);
