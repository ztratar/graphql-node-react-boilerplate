import elasticsearch from 'elasticsearch';

import {
  ELASTICSEARCH_FQDNS
} from '../../config/environment';

const client = new elasticsearch.Client({
  hosts: ELASTICSEARCH_FQDNS,
  log: ['error', 'warning', 'info']
});

export default client;
