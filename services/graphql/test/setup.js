import 'source-map-support/register';
import 'babel-polyfill';

global.__NODE_ENV__ = process.env.NODE_ENV;
global.__RELEASE_SHA__ = null;
global.__DEV__ = true;
global.__TEST__ = true;
