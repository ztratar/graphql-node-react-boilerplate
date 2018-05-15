import Immutable from 'immutable';

import locationBeforeTransitions from './locationBeforeTransitions';
import defaultState from '../../default';

export default (prevState = defaultState.routing, action) => prevState.merge({
  locationBeforeTransitions: locationBeforeTransitions(prevState.get('locationBeforeTransitions'), action)
});
