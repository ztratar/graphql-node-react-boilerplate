import Promise from 'bluebird';

import connectExample from './example';
import connectTimer from './timer';

const connected = Promise.all([
  // Connect additional workers here
  connectExample(),
  connectTimer()
]);

export default connected;
