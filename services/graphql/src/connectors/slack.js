import Promise from 'bluebird';
import { inject } from 'injectorator';
import Slack from '@slack/client';

import {
  SlackSendMessageChannelRequiredError,
  SlackSendMessageTextRequiredError
} from '../errors/internal';

import throws from '../decorators/throws';

import {
  SLACK_API_TOKEN,
  SLACK_BOT_USERNAME,
  SLACK_BOT_ICON_URL
} from '../../config/environment';

import BaseConnector from './base';

@inject({
  SLACK_API_TOKEN,
  Promise: () => Promise
})
@throws({
  SlackSendMessageChannelRequiredError,
  SlackSendMessageTextRequiredError
})
export default class SlackConnector extends BaseConnector {
  constructor (
    { SLACK_API_TOKEN, Promise }
  ) {
    super();

    this._Promise = Promise;

    this._webClient = new Slack.WebClient(SLACK_API_TOKEN);
  }

  sendMessage ({
    channel,
    text
  }) {
    if (!channel) throw new SlackConnector.errors.SlackSendMessageChannelRequiredError();
    if (!text) throw new SlackConnector.errors.SlackSendMessageTextRequiredError();

    return this._Promise.resolve(this._webClient.chat.postMessage(channel, text, {
      username: SLACK_BOT_USERNAME || 'Test (set your env var)',
      icon_url: SLACK_BOT_ICON_URL || undefined
    }));
  }
}
