import { handleActions } from 'redux-actions';
import Immutable from 'immutable';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/auth';

const auth = handleActions({
  [TYPES.setLoggedIn]: (prevState, action) => prevState.set('token', action.payload),
  [TYPES.setLoggedOut]: (prevState, action) => prevState.set('token', null),
  [TYPES.setIdentified]: (prevState, action) => prevState.set('identified', true),
  [TYPES.noAppAccess]: (prevState, action) => prevState.set('appAccess', false)
}, defaultState.app.get('auth'));

export default auth;
