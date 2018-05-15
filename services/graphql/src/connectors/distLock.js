import Microlock, { AlreadyLockedError } from 'microlock';
import debug from 'debug';
import { hostname } from 'os';

const log = debug('graphql:connectors:dist_lock');

import etcd from '../io/etcd';

export default class DistLock extends Microlock {
  constructor (namespace, ttl) {
    super(etcd, namespace, hostname(), ttl);
  }
}

export {
  AlreadyLockedError
};
