import { handleActions } from 'redux-actions';
import Immutable from 'immutable';
import _ from 'underscore';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/meta';

const set = (prevState, action) => {
  return prevState.merge((
    _.isObject(action.payload) ||
    _.isArray(action.payload)
  ) && !Immutable.is(action.payload) ? (
    Immutable.fromJS(action.payload)
  ) : (
    action.payload
  ));
};

const revert = (prevState, action) => defaultState.app.get('meta');

export default handleActions({
  [TYPES.set]: set,
  [TYPES.revert]: revert
}, defaultState.app.get('meta'));
