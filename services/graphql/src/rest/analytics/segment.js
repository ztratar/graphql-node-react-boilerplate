import { Router } from 'express';
import debug from 'debug';
import { createHmac } from 'crypto';

import {
  SEGMENT_SHARED_SECRET
} from '../../../config/environment';

import { increment, gauge } from '../../io/statsd';

const log = debug('graphql:rest:analytics:segment');

const router = Router();

router.use((req, res, next) => {
  log('received %s', req.url);
  next();
});

router.post('/webhook', async (req, res, next) => {
  log('segment webhook triggered');
  try {
    const signature = req.headers['x-signature'];
    const digest = createHmac('sha1', SEGMENT_SHARED_SECRET)
        .update(new Buffer(JSON.stringify(req.body),'utf-8'))
        .digest('hex');

    if (signature !== digest) {
      log('segment payload signature mismatch');
      throw new Error('segment payload signature mismatch');
    }

    const startTime = new Date().getTime();

    const {
      body: {
        userId,
        timestamp
      },
      context: {
        models: {
          User
        }
      }
    } = req;

    if (!userId) {
      log('webhook skipping event for anonymous user');
      return res.status(200).send({
        message: 'ok'
      });
    }

    log('webhook invoking for user %s', userId);

    increment('rest_analytics_segment_webhook.invoke');

    await User.updateLastActivityAt(userId, timestamp);

    gauge('rest_analytics_segment_webhook.response_time', new Date().getTime() - startTime);

    return res.status(200).send({
      message: 'ok'
    });
  } catch (e) {
    next(e);
  }
})

export default router;
