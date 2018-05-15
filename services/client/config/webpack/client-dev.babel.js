import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import fs from 'fs';

import base from './client.babel';

import * as envr from '../environment';

const babelConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/.babelrc`));

const globals = {
  ...Object.keys(envr).reduce((globals, key) => ({
    ...globals,
    [`__${key.toUpperCase()}__`]: JSON.stringify(envr[key])
  }), {}),
  __CLIENT__: true,
  __SERVER__: false,
  __PRODUCTION__: false,
  __DEV__: true,
  __RELEASE_SHA__: JSON.stringify(null),
  'process.env': {
    ...Object.keys(envr).reduce((hash, key) => ({
      ...hash,
      [key]: JSON.stringify(envr[key] || '')
    }), {})
  }
};

const devServer = {
  publicPath: `${envr.ASSETS_FQDN}/`,
  hot: true,
  inline: false,
  lazy: false,
  quiet: true,
  devtool: 'source-map',
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  stats: {
    colors: true
  },
  port: envr.WEBPACK_PORT,
  host: envr.HOSTNAME
};

const config = {
  ...base,
  cache: true,
  devtool: 'source-map',
  entry: {
    ...base.entry,
    client: [
      `webpack-dev-server/client?http://${envr.HOSTNAME}:${envr.WEBPACK_PORT}`,
      'webpack/hot/only-dev-server',
      ...base.entry.client
    ]
  },
  devServer,
  output: {
    ...base.output,
    publicPath: devServer.publicPath,
    hotUpdateMainFilename: 'update/[hash]/update.json',
    hotUpdateChunkFilename: 'update/[hash]/[id].update.js'
  },
  plugins: [
    new webpack.DefinePlugin(globals),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new CopyPlugin([{
      from: 'assets/fonts/**',
      to: 'dist'
    }, {
      from: 'assets/images/**',
      to: 'dist'
    }, {
      from: 'assets/sounds/**',
      to: 'dist'
    }])
  ],
  module: {
    ...base.module,
    postLoaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        ...babelConfig,
        cacheDirectory: true
      }
    }]
  }
};

export default config;
module.exports = config; //needed for webpack (uses commonjs require)
