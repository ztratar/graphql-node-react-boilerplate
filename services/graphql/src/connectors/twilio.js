import twilio from 'twilio';
import Promise from 'bluebird';
import debug from 'debug';
import { inject } from 'injectorator';

import BaseConnector from './base';

import {
  TWILIO_ACCOUNT_SID,
  TWILIO_ACCOUNT_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID
} from '../../config/environment';

const log = debug('graphql:connectors:twilio');

@inject({
  TWILIO_ACCOUNT_SID,
  TWILIO_ACCOUNT_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID,
  Promise: () => Promise
})
export default class TwilioConnector extends BaseConnector {
  constructor ({
    TWILIO_ACCOUNT_SID,
    TWILIO_ACCOUNT_AUTH_TOKEN,
    TWILIO_MESSAGING_SERVICE_SID,
    Promise
  }) {
    super();

    log('creating twilio connector with account sid %s and message service sid %s', TWILIO_ACCOUNT_SID, TWILIO_MESSAGING_SERVICE_SID);

    this._client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_ACCOUNT_AUTH_TOKEN);
    this._MessagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    this._Promise = Promise;
  }

  parseMessage (message) {
    log('parsing message %O', message);
    return {
      id: message.sid,
      createdAt: message.date_created,
      updatedAt: message.date_updated,
      sentAt: message.date_sent,
      status: message.status,
      errorCode: message.error_code,
      errorMessage: message.error_message,
      body: message.body,
      numSegments: message.num_segments,
      numMedia: message.num_media,
      direction: message.direction,
      from: message.from,
      to: message.to,
      price: message.price,
      url: message.url
    };
  }

  sendMessage ({
    to,
    body
  }) {
    const MessagingServiceSid = this._MessagingServiceSid;

    log('sending message "%s" to %s', body, to);

    return new this._Promise((resolve, reject) => this._client.messages.create({
      body,
      to,
      MessagingServiceSid
    }, (err, message) => err ? reject(err) : resolve(this.parseMessage(message))))
    .then(message => {
      log('successfully sent message "%s"', message.id);
      return message;
    })
    .catch(e => {
      log('error sending message: %s', e.message);
      throw e;
    });
  }
}
