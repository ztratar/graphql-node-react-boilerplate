import { Router } from 'express';
import debug from 'debug';
import Promise from 'bluebird';

import { tokenToObject } from '../../lib/crypto';
import { captureException } from '../../io/raven';
import { SENDGRID_WEBHOOK_SECRET } from '../../../config/environment';
import { EmailNotFoundError } from '../../errors/internal';

const router = Router();

const log = debug('graphql:rest:sendgrid');

router.use(async (req, res, next) => {
  try {
    await tokenToObject(req.query.token, SENDGRID_WEBHOOK_SECRET);
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

router.get('/webhook', (req, res) => res.status(204).send(null))

router.post('/webhook', async (req, res, next) => {
  try {
    const { models: { Email, User } } = req.context;

    const events = req.body;

    log('sendgrid webhook invoked with payload %O', req.body);

    await Promise.all(events.map(async (data) => {
      try {
        const sendgridMessageId = data.sg_message_id;

        if (!sendgridMessageId) {
          log('sendgridMessageId not defined on webhook data.  skipping...');
          return;
        }

        const email = await Email.findBySendgridMessageId(sendgridMessageId);

        if (!email) {
          log('could not find email with sendgridMessageId "%s"', sendgridMessageId);
          captureException(new EmailNotFoundError({
            data:{
              sendgridMessageId
            }
          }));
          return null;
        }

        const user = await User.findByEmail(data.email);

        if (!user) {
          log('could not find user with email "%s"', data.email);
          captureException(new UserNotFoundError({
            data: {
              email: data.email
            }
          }));
          return null;
        }

        const date = new Date(event.timestamp * 1000);

        switch (data.event) {
          case 'processed':
            log('handling processed event for email "%s"', email.id);
            return await Email.markAsProcessed(email, user, date);
          case 'dropped':
            log('handling dropped event for email "%s"', email.id);
            return await Email.markAsDropped(email, user, date);
          case 'delivered':
            log('handling delivered event for email "%s"', email.id);
            return await Email.markAsDelivered(email, user, date);
          case 'deferred':
            log('handling deferred event for email "%s"', email.id);
            return await Email.markAsDeferred(email, user, date);
          case 'bounce':
            log('handling bounce event for email "%s"', email.id);
            return await Email.markAsBounced(email, user, date);
          case 'open':
            log('handling open event for email "%s"', email.id);
            return await Email.markAsOpened(email, user, date);
          case 'click':
            log('handling click event for email "%s"', email.id);
            return await Email.markAsLinkClicked(email, user, date);
          case 'spam_report':
            log('handling spam_report event for email "%s"', email.id);
            return await Email.markAsSpam(email, user, date);
        }

        log('unrecognized event "%s" for email "%s".  skipping...', data.event, email.id);
        return null;
      } catch (e) {
        log('encountered exception while processing event "%s" with data %O', data.event, data);
        captureException(e);
      }
    }));

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
