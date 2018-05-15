import { handleActions } from 'redux-actions';

import defaultState from '../../default';
import { TYPES } from '../../actions/app/rendered';

const rendered = (prevState, action) => true;

export default handleActions({
  [TYPES.rendered]: rendered,
}, defaultState.app.get('rendered'));
