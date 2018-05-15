import Promise from 'bluebird';
import debug from 'debug';

import getModels from '../models';
import { info } from '../io/logger';
import { tokenToObject } from '../lib/crypto';

const log = debug('graphql:middleware:auth');

let modelsGet = getModels;

if (__DEV__) {
  if (module.hot) {
    module.hot.accept('../models', () => {
      modelsGet = require('../models').default;
    });
  }
}

export default async (req, res, next) => {
  try {
    if (req.query.state) log(`using token from stripe oauth redirect state query param`);
    const token = req.query.state
        || req.query.token
        || (req.headers.Authorization || req.headers.authorization || '').replace('Bearer ', '')
        || req.cookies.token
        || null;
    if (!token) return next();
    let id = null;
    try {
      const obj = await tokenToObject(token);
      id = obj.id;
      if (!id) return next();
    } catch (e) {
      return next();
    }
    log(`attempting to authenticate user ${id}`);

    const { User } = await modelsGet({});

    req.user = await User.findById(id);

    if (req.user) log(`user ${req.user.id} authenticated`);

    next();
  } catch (e) {
    console.trace(e);
    next(e);
  }
};
