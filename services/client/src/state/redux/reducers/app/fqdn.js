import { handleActions } from 'redux-actions';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/fqdn';

const set = (prevState, action) => action.payload;

export default handleActions({
  [TYPES.set]: set,
}, defaultState.app.get('fqdn'));
