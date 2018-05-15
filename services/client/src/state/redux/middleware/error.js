import debug from 'debug';
import { add as addAlert } from 'state/redux/actions/app/alerts';

const log = debug('client:state:redux:middleware:error');

export default store => next => action => {
  if (__CLIENT__) {
    if (action.type === 'APOLLO_MUTATION_ERROR' || action.type === 'APOLLO_QUERY_ERROR') {
      if (action.error && action.error.graphQLErrors) {
        action.error.graphQLErrors
          .filter(({ message }) => !!message)
          .forEach(({ message: text }) => {
            log('dispatching error message "%s"', text);
            store.dispatch(addAlert({
              text
            }));
          });
      }
    }
  }
  next(action);
};
