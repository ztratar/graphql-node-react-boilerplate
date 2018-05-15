import { Router } from 'express';
import debug from 'debug';

import { tokenToObject } from '../../lib/crypto';
import { captureException } from '../../io/raven';
import { STRIPE_WEBHOOK_SECRET } from '../../../config/environment';

const router = Router();

const log = debug('graphql:rest:stripe');

router.use(async (req, res, next) => {
  try {
    await tokenToObject(req.query.token, STRIPE_WEBHOOK_SECRET);
    log('received authorized request');
    next();
  } catch (e) {
    captureException(e);
    log('received unauthorized request');
    return res.status(401).send({
      message: 'unauthorized'
    });
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const { body: event, context: { models: { User } } } = req;

    log('event "%s" received', event.type.toLowerCase());

    if (!event.livemode) {
      log('stripe test mode event');
    }

    switch (event.type.toLowerCase()) {
      case 'invoice.payment_succeeded':
        log('handling event "invoice.payment_succeeded"');
        await User.paymentSucceeded(event.data.object.customer, event.data.object.date);
        break;
      case 'invoice.payment_failed':
        log('handling event "invoice.payment_failed"');
        await User.paymentFailed(event.data.object.customer);
        break;
      default:
        log('discarding unhandled event "%s"', event.type.toLowerCase());
    }

    res.status(204).send(null);
  } catch (e) {
    log('error handling event: %s', e.message);
    captureException(e);
    res.status(500).send({
      message: e.message
    });
  }
});

export default router;
