import debug from 'debug';
import OpticsAgent from 'optics-agent';

import { increment, gauge } from '../io/statsd';
import Context from '../lib/context';
import getModels from '../models';

const log = debug('graphql:middleware:context');

let modelsGet = getModels;

if (__DEV__) {
  if (module.hot) {
    module.hot.accept('../models', () => {
      modelsGet = require('../models').default;
    });
  }
}

const middleware = async (req, res, next) => {
  try {
    let context = null;

    const startTime = new Date().getTime();

    increment('http.request');

    // NOTE: This frees up references after the response is sent to allow the GC to do it's thing
    res.once('finish', () => context && context.destructor ? context.destructor() : null);
    res.once('finish', () => {
      const totalTime = new Date().getTime() - startTime;
      if (user) {
        log('request finished for user %s - %s ms', user.id, totalTime);
      } else {
        log('request finished for anonymous user - %s ms', totalTime);
      }
      gauge('http.response_time', totalTime);
      increment('http.response');
    });

    const user = req.user || null;

    if (user) {
      log(`creating context for user %s`, user.id);
    } else {
      log('creating context for anonymous user');
    }

    const models = await modelsGet(user);

    const opticsContext = __PRODUCTION__ ? OpticsAgent.context(req) : undefined;

    req.context = new Context({
      user,
      models,
      opticsContext
    });

    next();
  } catch (e) {
    console.trace(e);
    next(e);
  }
};

export default middleware;
