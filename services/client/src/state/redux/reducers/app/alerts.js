import { handleActions } from 'redux-actions';
import _ from 'underscore';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/alerts';

const add = (prevState, action) => {
  // Alerts have the format of:
  // {
  //   id: string,
  //   text: string,
  //   color: string,
  //   timeout: number,
  //   onTimeout: function
  // }
  return prevState.push(action.payload);
}

const remove = (prevState, action) => {
  return prevState.filter((error) => error.id !== action.payload);
}

export default handleActions({
  [TYPES.add]: add,
  [TYPES.remove]: remove
}, defaultState.app.get('alerts'));
