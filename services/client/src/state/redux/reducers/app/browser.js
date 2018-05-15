import { handleActions } from 'redux-actions';
import defaultState from '../../default';

const captureBodyScroll = (prevState, action) => prevState.set('bodyScrollOffset', action.payload);
const captureWindowDimensions = (prevState, action) => prevState.set('window', action.payload);

export default handleActions({
  'BODY_SCROLL': captureBodyScroll,
  'WINDOW_RESIZE': captureWindowDimensions
}, defaultState.app.get('browser'));
