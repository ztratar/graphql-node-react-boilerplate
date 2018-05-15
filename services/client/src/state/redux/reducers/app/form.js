import { handleActions } from 'redux-actions';
import Immutable from 'immutable';
import _ from 'underscore';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/form';

const create = (prevState, action) => prevState.merge({
  [action.payload.key]: action.payload.value
});

const update = (prevState, action) => {
  if (!prevState.get(action.payload.key)) throw new Error(`Cannot update non-existent form with key ${action.payload.key}`);
  return prevState.mergeDeep({
    [action.payload.key]: action.payload.value
  });
};

const set = (prevState, action) => {
  if (!prevState.get(action.payload.key)) throw new Error(`Cannot update non-existent form with key ${action.payload.key}`);

  const path = _.isString(action.payload.path) ? [action.payload.path] : action.payload.path;

  const value = (_.isObject(action.payload.value) || _.isArray(action.payload.data)) && !Immutable.is(action.payload.value) ? Immutable.fromJS(action.payload.value) : action.payload.value;

  return prevState.setIn([action.payload.key, ...path], value);
};

const destroy = (prevState, action) => prevState.delete(action.payload.key);

const form = handleActions({
  [TYPES.create]: create,
  [TYPES.update]: update,
  [TYPES.set]: set,
  [TYPES.destroy]: destroy
}, defaultState.app.get('form'));

export default form;
