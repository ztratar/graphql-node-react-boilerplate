import Microlock from 'microlock';

import etcd from '../io/etcd';

export default (key, id, ttl = 15) => new Microlock(etcd, key, id, ttl);
