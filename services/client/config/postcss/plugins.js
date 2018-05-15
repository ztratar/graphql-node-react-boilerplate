import rucksack from 'rucksack-css';
import variables from 'postcss-simple-vars';
import nested from 'postcss-nested';
import forLoops from 'postcss-for';
import calc from 'postcss-calc';
import mixins from 'postcss-mixins';
import assets from 'postcss-assets';
//import assetsRebase from 'postcss-assets-rebase';
import url from 'postcss-url';
import clearfix from 'postcss-clearfix';
import colors from 'postcss-color-function';
import fontMagician from 'postcss-font-magician';
import cssVars from './variables';

import {
  ASSETS_FQDN
} from '../environment';

const mixinsDir = `${process.cwd()}/src/styles/mixins`;
const basePath = `${process.cwd()}/src/`;
const baseUrl = ASSETS_FQDN;
const loadPaths = ['assets/', 'assets/fonts', 'assets/images'];

const config = [
  forLoops(),
  variables({
    unknown: (node, name, result) => node.warn(result, 'Unknown variable ' + name),
    variables: () => cssVars,
  }),
  colors(),
  clearfix(),
  calc(),
  nested(),
  mixins({
    mixinsDir
  }),
  url({
    url: 'rebase'
  }),
  assets({
    basePath,
    loadPaths,
    baseUrl
  }),
  fontMagician(),
  rucksack({
    autoprefixer: true
  })
]

export default config;
