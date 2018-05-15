import webpack from 'webpack';
import childProcess from 'child_process';
import nodeExternals from 'webpack-node-externals';

import banner from './banner';

import * as envr from '../environment';

const globals = {
  ...Object.keys(envr).reduce((globals, key) => ({
    ...globals,
    [`__${key.toUpperCase()}__`]: JSON.stringify(envr[key])
  }), {}),
  __CLIENT__: false,
  __SERVER__: true,
  __PRODUCTION__: true,
  __TEST__: false,
  __DEV__: false,
  __RELEASE_SHA__: JSON.stringify(childProcess.execSync('git rev-parse HEAD').toString())
};


const config = {
  target: 'node',
  cache: false,
  context: __dirname,
  devtool: 'source-map',
  entry: [
    'babel-polyfill',
    '../../src/index'
  ],
  output: {
    path: `${process.cwd()}/dist`,
    filename: 'index.js'
  },
  plugins: [
    new webpack.DefinePlugin(globals),
    new webpack.BannerPlugin(banner, {raw: true, entryOnly: false })
  ],
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'raw'
    }, {
      test: /\.(png|jpg|gif|ico)?$/,
      loader: 'url'
    }],
    postLoaders: [],
    noParse: /\.min\.js/
  },
  externals: [
    nodeExternals({
      whitelist: [
        'webpack/hot/poll?1000'
      ]
    })
  ],
  node: {
    __dirname: true
  }
};

export default config;
module.exports = config; //needed for webpack (uses commonjs require)
