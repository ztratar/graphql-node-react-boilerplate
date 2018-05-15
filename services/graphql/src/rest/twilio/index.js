import { Router } from 'express';
import debug from 'debug';
import qs from 'querystring';
import Promise from 'bluebird';

import { tokenToObject } from '../../lib/crypto';
import { captureException } from '../../io/raven';
import { TWILIO_WEBHOOK_SECRET } from '../../../config/environment';

const router = Router();

const log = debug('graphql:rest:twilio');

router.use(async (req, res, next) => {
  try {
    log('received token', req.query.token);
    await tokenToObject(req.query.token, TWILIO_WEBHOOK_SECRET);
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

router.use(async (req, res, next) => {
  try {
    log('parsing twilio request body');

    req.body = await new Promise((resolve, reject) => {
      let body = '';

      req.on('data', data => {
        body += data;
        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) {
          req.connection.destroy();
          return reject(new Error('body too large'));
        }
      });

      req.on('end', () => {
        const data = qs.parse(body);
        return resolve(data);
      });

      req.on('error', err => reject(err));
    });

    next();
  } catch (e) {
    log('error parsing twilio form data: %s', e.message);
    captureException(e);
    res.status(500).send({
      message: e.message
    });
  }
});

router.post('/sms/incoming', async (req, res, next) => {
  try {
    log('receiving incoming sms message from twilio via /rest/twilio/sms/outgoing');

    const { models: { User, Message } } = req.context;

    const user = await User.findByPhoneNumber(req.body.From);

    if (!user) {
      throw new Error(`user with phone number ${req.body.From} not found via /rest/twilio/sms/outgoing`);
    }

    const text = req.body.Body;

    await Promise.all([
      Message.sendFromUser({
        user,
        text,
        source: 'sms'
      }),
      User.incrementNumSmsSent(user)
    ]);

    res.status(204).send(null);
  } catch (e) {
    log('error handling event: %s', e.message);
    captureException(e);
    res.status(500).send({
      message: e.message
    });
  }
});

router.post('/sms/outgoing', async (req, res, next) => {
  try {
    log('receiving message status update from twilio via /rest/twilio/sms/outgoing');

    const { models: { Message } } = req.context;

    const message = await Message.findBySMSMessageId(req.body.MessageSid);

    if (!message) {
      log('message with sid "%s" not found via /rest/twilio/sms/outgoing', req.body.MessageSid);
      return res.status(204).send(null);
    }

    await Message.updateStatus(message, req.body);

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
