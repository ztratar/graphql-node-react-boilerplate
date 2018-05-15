import webpack from 'webpack';
import S3Plugin from 'webpack-s3-plugin';
import childProcess from 'child_process';
import CopyPlugin from 'copy-webpack-plugin';
import postCssPlugins from '../postcss/plugins';
import pkg from '../../package.json';

import * as envr from '../environment';

const blacklist = {
  'SENTRY_NODE_DSN': true
};

const globals = {
  ...Object.keys(envr).filter(key => !blacklist[key]).reduce((globals, key) => ({
    ...globals,
    [`__${key.toUpperCase()}__`]: JSON.stringify(envr[key])
  }), {}),
  __CLIENT__: true,
  __SERVER__: false,
  __PRODUCTION__: true,
  __DEV__: false,
  __RELEASE_SHA__: JSON.stringify(childProcess.execSync('git rev-parse HEAD').toString()),
  'process.env': {
    ...Object.keys(envr).filter(key => !blacklist[key]).reduce((hash, key) => ({
      ...hash,
      [key]: JSON.stringify(envr[key] || '')
    }), {})
  }
};

const config = {
  target: 'web',
  cache: false,
  context: __dirname,
  debug: false,
  devtool: 'source-map',
  entry: {
    client: [
      'babel-polyfill',
      '../../src/client'
    ],
    vendor: [
      ...pkg.webpack.vendor
    ]
  },
  output: {
    path: `${process.cwd()}/dist`,
    filename: 'client.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin(globals),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
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
    loaders: [{
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.(png|jpg|gif|ico)?$/,
      loader: 'url?limit=30000'
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
      test: /\.(svg|ogv)?$/,
      loader: 'raw'
    }, {
      test: /\.css$/,
      loaders: [
        'isomorph-style',
        'css?modules&sourceMap&localIdentName=[name]__[local]___[hash:base64:5]',
        'postcss?sourceMap'
      ]
    }, {
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader'
    }],
    postLoaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }],
    noParse: /\.min\.js/
  },
  resolve: {
    modulesDirectories: [
      'src',
      'dist',
      'node_modules'
    ],
    extensions: ['', '.json', '.js'],
    alias: {
      'graphql-service': '../../../graphql/src',
      'React': 'react' // horrible hack for react-autosuggest
    }
  },
  postcss: postCssPlugins
};

// if (
//   envr.ASSETS_FQDN.indexOf('http://localhost') === -1 &&
//   envr.ASSETS_FQDN.indexOf('http://127.0.0.1') === -1 &&
//   envr.S3_ACCESS_KEY_ID &&
//   envr.S3_SECRET_ACCESS_KEY &&
//   envr.S3_REGION &&
//   envr.S3_BUCKET &&
//   envr.CF_DISTRIBUTION_ID
// ) {
//   config.plugins.push(new S3Plugin({
//     progress: true,
//     s3Options: {
//       accessKeyId: envr.S3_ACCESS_KEY_ID,
//       secretAccessKey: envr.S3_SECRET_ACCESS_KEY,
//       region: envr.S3_REGION,
//     },
//     s3UploadOptions: {
//       Bucket: envr.S3_BUCKET
//     },
//     cdnizerOptions: {
//       defaultCDNBase: envr.ASSETS_FQDN
//     },
//     cloudfrontInvalidateOptions: {
//       DistributionId: envr.CF_DISTRIBUTION_ID,
//       Items: [`/${envr.BUILD_STAMP}/**`]
//     },
//     basePathTransform: () => envr.BUILD_STAMP
//   }));
// }

export default config;
module.exports = config; //needed for webpack (uses commonjs require)
