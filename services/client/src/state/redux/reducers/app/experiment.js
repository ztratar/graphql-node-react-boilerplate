import { handleActions } from 'redux-actions';
import Immutable from 'immutable';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/experiment';

const experiment = handleActions({
  [TYPES.load]: (prevState, { payload: { key, value }}) => prevState.set(key, value),
  [TYPES.set]: (prevState, { payload: { key, value }}) => prevState.set(key, value),
  [TYPES.clear]: (prevState, { payload: { key }}) => prevState.delete(key)
}, defaultState.app.get('auth'));

export default experiment;
