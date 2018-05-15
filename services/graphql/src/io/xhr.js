import axios from 'axios';
import debug from 'debug';
import Promise from 'bluebird';

const log = debug('graphql:io:xhr');

const logger = (res) => {
  log(`xhr ${res.config.method.toUpperCase()} ${res.config.url} (${res.status}) -> ${res.headers ? res.headers.via : '*'}`);
  return res;
};

axios.interceptors.response.use(logger, (res) => {
  logger(res);
  return Promise.reject(res);
});

export default axios;
