import { inject } from 'injectorator';
import { mail as MailHelper } from 'sendgrid';
import debug from 'debug';

import sendgrid from '../../io/sendgrid';
import BaseSendgridConnector from './base';

import {
  SendgridMailBadRequestError,
  SendgridMailUnauthorizedError,
  SendgridMailForbiddenError,
  SendgridMailNotFoundError,
  SendgridMailMethodNotAlloedError,
  SendgridMailPayloadTooLargeError,
  SendgridMailUnsupportedMediaTypeError,
  SendgridMailTooManyRequestsError,
  SendgridMailUnknownError,
  SendgridMailNotAvailableError
} from '../../errors/sendgrid/mail';

const log = debug('graphql:connectors:sendgrid:mail');

@inject({
  MailHelper: () => MailHelper,
  sendgrid: () => sendgrid
})
export default class SendgridMailConnector extends BaseSendgridConnector {
  static throwError ({ statusCode, data }) {
    log(`handling error with status code ${statusCode}`);
    switch (statusCode) {
      case 400: throw new SendgridMailBadRequestError({
        data
      });
      case 401: throw new SendgridMailUnauthorizedError({
        data
      });
      case 403: throw new SendgridMailForbiddenError({
        data
      });
      case 404: throw new SendgridMailNotFoundError({
        data
      });
      case 405: throw new SendgridMailMethodNotAlloedError({
        data
      });
      case 413: throw new SendgridMailPayloadTooLargeError({
        data
      });
      case 415: throw new SendgridMailUnsupportedMediaTypeError({
        data
      });
      case 429: throw new SendgridMailTooManyRequestsError({
        data
      });
      case 503: throw new SendgridMailNotAvailableError({
        data
      });
      case 500:
      default: throw new SendgridMailUnknownError({
        data
      });
    }
  }
  constructor ({
    MailHelper,
    sendgrid
  }) {
    super();

    this._MailHelper = MailHelper;
    this._sendgrid = sendgrid;
  }

  async _sendMail (data) {
    log(`attemping to send mail`);

    const request = this._sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: data.toJSON()
    });
    try {
      const response = await this._sendgrid.API(request);
      if (response.statusCode >= 400) {
        log(`error sending mail`);
        SendgridConnector.throwError(response);
      }
      log(`successfully sent mail`);
      const sendgridMessageId = response.headers['x-message-id']
      return {
        sendgridMessageId
      };
    } catch (e) {
      log(`unknown error sending mail`);
      SendgridMailConnector.throwError(e.response);
    }
  }

  async send ({
    from: { addr: fromAddr, name: fromName },
    to = [],
    subject = '',
    categories = [],
    ccs = [],
    bccs = [],
    attachments = [],
    html,
    text
  }) {
    if (!text && !html) return;

    const email = new this._MailHelper.Mail();

    const personalization = new this._MailHelper.Personalization();

    log(`sending mail from ${fromName} - ${fromAddr} with subject "${subject}"`)

    email.setFrom(new this._MailHelper.Email(fromAddr, fromName));

    email.setSubject(subject);

    to.forEach(({ addr: toAddr, name: toName }) => personalization.addTo(new this._MailHelper.Email(toAddr, toName)));

    categories.forEach((category) => email.addCategory(new this._MailHelper.Category(category)));

    ccs.forEach(({ addr: ccAddr, name: ccName }) => personalization.addCc(new this._MailHelper.Email(ccAddr, ccName)));

    bccs.forEach(({ addr: bccAddr, name: bccName }) => personalization.addBcc(new this._MailHelper.Email(bccAddr, bccName)));

    attachments.forEach(({ content, type, filename, disposition, contentId }) => {

      const attachment = new this._MailHelper.Attachment();

      attachment.setContent(content);
      attachment.setType(type);
      attachment.setFilename(filename);
      attachment.setDisposition(disposition);
      attachment.setContentId(contentId);
      email.addAttachment(attachment);

    });

    if (text) email.addContent(new this._MailHelper.Content('text/plain', text));

    if (html) email.addContent(new this._MailHelper.Content('text/html', html));

    email.addPersonalization(personalization);

    const r = await this._sendMail(email);

    log(`mail from ${fromName} - ${fromAddr} with subject "${subject}" sent successfully.  message id "%s"`, r.sendgridMessageId);

    return r;
  }
}
