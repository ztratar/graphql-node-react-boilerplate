import http from 'http';
import express from 'express';
import Promise from 'bluebird';
import debug from 'debug';
import cors from 'cors';
import { error } from '../io/logger';

const log = debug('graphql:io:http');

import {
  HOSTNAME,
  PORT
} from '../../config/environment';

export const app = express();

let healthy = false;

app.use(cors());

app.get('/health', (req, res) => {
  log(`health check request... healthy? -> ${healthy}`);
  return healthy ? res.status(200).send({status: 'up'}) : res.status(503).send({status: 'down'});
});

export const server = http.createServer(app);

export const listen = new Promise((resolve, reject) => server.listen(PORT, err => {
  if (err) {
    error(`error booting server -> ${err.message}`);
    return reject(err);
  }
  log(`server online`);
  return resolve();
}));

listen.then(() => {
  log('server now healthy');
  healthy = true;
});
