import webpack from 'webpack';

import base from './server.babel';
import banner from './banner';

import * as envr from '../environment';

const globals = {
  ...Object.keys(envr).reduce((globals, key) => ({
    ...globals,
    [`__${key.toUpperCase()}__`]: JSON.stringify(envr[key])
  }), {}),
  __CLIENT__: false,
  __SERVER__: true,
  __PRODUCTION__: false,
  __TEST__: false,
  __DEV__: true,
  __RELEASE_SHA__: JSON.stringify(null)
};

const config = {
  ...base,
  cache: true,
  debug: true,
  entry: [
    'webpack/hot/poll?1000',
    ...base.entry
  ],
  output: {
    ...base.output,
    publicPath: `http://${envr.HOSTNAME}:${envr.WEBPACK_PORT}`
  },
  plugins: [
    new webpack.DefinePlugin(globals),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.BannerPlugin(banner, {raw: true, entryOnly: false })
  ]
};

export default config;
module.exports = config; //needed for webpack (uses commonjs require)
