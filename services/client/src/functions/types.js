import { isURL } from 'validator';

export const isHTTPUrl = value => isURL(value, {
  protocols: ['http', 'https'],
  require_protocol: true
});
