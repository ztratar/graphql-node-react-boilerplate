import debug from 'debug';

import { TYPES } from 'state/redux/actions/app/form';
import { captureBreadcrumb, captureException } from 'io/raven-browser';

const log = debug('client:state:redux:middleware:raven');

const category = 'redux_action';

// NOTE: DO NOT IMPORT THIS MIDDLEWARE DIRECTLY INTO state/redux/index.js!   IT NEEDS TO BE INJECTED FROM THE client.js FILE
//       BECAUSE IT CANNOT BE LOADED ON THE SERVER AS raven-js REQUIRES ACCESS TO THE window OBJECT!!!
export default store => next => action => {
  if (!__CLIENT__) return next();
  try {
    const message = action.type.toLowerCase();

    let breadcrumb = null;

    switch (message) {
      case 'apollo_query_init':
        breadcrumb = {
          message,
          category,
          data: {
            queryString: action.queryString,
            variables: JSON.stringify(action.variables || {}),
            fetchPolicy: action.fetchPolicy,
            returnPartialData: action.returnPartialData,
            queryId: action.queryId,
            requestId: action.requestId,
            storePreviousVariables: action.storePreviousVariables,
            isPoll: action.isPoll,
            isRefetch: action.isRefetch,
            metadata: JSON.stringify(action.metadata || {})
          }
        };
        log('capturing sentry breadcrumb for apollo query init %O', breadcrumb);
        break;
      case 'apollo_query_result':
        breadcrumb = {
          message,
          category,
          data: {
            resultDataKeys: Object.keys(action.result.data).join(','),
            resultErrors: JSON.stringify(action.result.errors || []),
            operationName: action.operationName,
            queryId: action.queryId,
            requestId: action.requestId
          }
        };
        log('capturing sentry breadcrumb for apollo query result %O', breadcrumb);
        break;
      case 'apollo_query_stop':
        breadcrumb = {
          message,
          category,
          data: {
            queryId: action.queryId
          }
        };
        log('capturing sentry breadcrumb for apollo query stop %O', breadcrumb);
        break;
      case 'apollo_mutation_init':
        breadcrumb = {
          message,
          category,
          data: {
            operationName: action.operationName,
            mutationId: action.mutationId,
            variables: JSON.stringify(action.variables || {})
          }
        };
        log('capturing sentry breadcrumb for apollo mutation init %O', breadcrumb);
        break;
      case 'apollo_mutation_result':
        breadcrumb = {
          message,
          category,
          data: {
            operationName: action.operationName,
            mutationId: action.mutationId,
            resultDataKeys: Object.keys(action.result.data).join(','),
            resultErrors: JSON.stringify(action.result.errors || [])
          }
        };
        log('capturing sentry breadcrumb for apollo mutation result %O', breadcrumb);
        break;
      case TYPES.update:
      case TYPES.set:
        breadcrumb = {
          message,
          category,
          data: JSON.parse(JSON.stringify(action.payload))
        };
        log('capturing sentry breadcrumb for form set/update %O', breadcrumb);
        break;
    }

    if (breadcrumb) captureBreadcrumb(breadcrumb);

  } catch (e) {
    log('error adding breadcrumb %O', e);
    captureException(e);
  }

  next(action);
};
