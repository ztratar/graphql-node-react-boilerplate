import webpack from 'webpack';
import S3Plugin from 'webpack-s3-plugin';
import childProcess from 'child_process';
import postCssPlugins from '../postcss/plugins';

import banner from './banner';

import * as envr from '../environment';

const globals = {
  ...Object.keys(envr).reduce((globals, key) => ({
    ...globals,
    [`__${key.toUpperCase()}__`]: JSON.stringify(envr[key])
  }), {}),
  __RELEASE_SHA__: JSON.stringify(childProcess.execSync('git rev-parse HEAD').toString()),
  __CLIENT__: false,
  __SERVER__: true,
  __PRODUCTION__: true,
  __DEV__: false,
  __BUILD_STAMP__: JSON.stringify(new Date().toISOString())
};


const config = {
  target: 'node',
  cache: false,
  context: __dirname,
  devtool: 'source-map',
  entry: [
    'babel-polyfill',
    '../../src/server'
  ],
  output: {
    path: `${process.cwd()}/dist`,
    filename: 'server.js',
    publicPath: '/'
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
      test: /\.(png|jpg|gif|ico)?$/,
      loader: 'url?limit=30000'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.(mp3|wav)?$/,
      loader: 'url?limit=30000'
    }, {
      test: /\.(woff|woff2)$/,
      loader: 'url?prefix=font/&limit=5000'
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/octet-stream'
    }, {
      test: /\.mp4$/,
      loader: 'url?limit=10000&mimetype=video/mp4'
    }, {
      test: /\.ogv$/,
      loader: 'url?limit=10000&mimetype=video/ogv'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'raw'
    }, {
      test: /\.css$/,
      loaders: [
        'isomorph-style',
        'css?modules&sourceMap&localIdentName=[name]__[local]___[hash:base64:5]',
        'postcss?sourceMap'
      ]
    }, {
      test: /\.(graphql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader'
    }],
    postLoaders: [],
    noParse: /\.min\.js/
  },
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules',
      'dist'
    ],
    extensions: ['', '.json', '.js'],
    alias: {
      'graphql-service': '../../../graphql/src',
      'React': 'react' // horrible hack for react-autosuggest
    }
  },
  node: {
    __dirname: true
  },
  postcss: postCssPlugins
};

export default config;
module.exports = config; //needed for webpack (uses commonjs require)
