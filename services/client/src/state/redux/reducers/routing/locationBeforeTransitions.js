import { handleActions } from 'redux-actions';
import Immutable from 'immutable';

import defaultState from '../../default';

const TYPES = {
  locationChange: 'LOCATION_CHANGE'
};

const auth = handleActions({
  [TYPES.locationChange]: (prevState, action) => prevState.mergeDeep(action.payload)
}, defaultState.routing.get('locationBeforeTransitions'));

export default auth;
