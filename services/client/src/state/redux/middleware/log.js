import { log } from 'io/logger';

export default store => next => action => {
  if (__CLIENT__ && !(action.meta && action.meta.suppressLog)) log(`redux action (${action.type || 'unknown type'}) %o`, action);
  next(action);
};
