import Etcd from 'node-etcd';
import { readFileSync } from 'fs';
import debug from 'debug';
import Promise from 'bluebird';

import { ETCD_URLS } from '../../config/environment';

const log = debug('graphql:io:etcd');

const isSSL = ETCD_URLS.reduce((bool, url) => (
  bool || url.indexOf('https://') !== -1
));

let ca = null;

try {
  ca = readFileSync(`${process.cwd()}/ssl/etcd.pem`)
} catch (e) {
  ca = readFileSync(`${process.cwd()}/services/graphql/ssl/etcd.pem`)
}

const options = isSSL ? {
  ca
} : {};

const client = new Etcd(ETCD_URLS, options);

log(`using etcd cluster at ${ETCD_URLS.reduce((str, t) => `${str}${str.length ? ',' : ''}${t}`, '')}`);

Promise.promisifyAll(client);

export default client;
