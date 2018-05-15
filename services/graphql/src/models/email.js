import { inject } from 'injectorator';
import Sequelize from 'sequelize';
import Promise from 'bluebird';
import debug from 'debug';

import { NODE_ENV, REDIRECT_JWT_SECRET } from '../../config/environment';
import { captureException } from '../io/raven';
import sequelize from '../io/postgres';
import {
  RecipientsRequiredError,
  RecipientNotFoundError,
  SenderRequiredError,
  SenderNotFoundError,
  EmailNotFoundError,
  EmailRedirectTokenMismatchError
} from '../errors/internal';
import {
  EmailRedirectTokenAlreadyUsedError
} from '../errors/functional';
import throws from '../decorators/throws';
import transaction from '../decorators/transaction';
import { isValidEmail } from '../functions/validators';
import SequelizeConnector, { createSchema as createSequelizeSchema, DataTypes } from '../connectors/sequelize';
import SendgridMailConnector from '../connectors/sendgrid/mail';
import instantiate from '../functions/instantiate';
import ensure from '../functions/ensure';
import renderEmail from '../io/emailRenderer';
import { objectToToken } from '../lib/crypto';
import BaseModel from './base';

const log = debug('graphql:models:email');

const { schema: EmailSchema } = createSequelizeSchema('Email', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  scope: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  redirectToken: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  redirectTokenUsed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null
  },
  redirectTokenUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  contentType: {
    type: DataTypes.ENUM,
    values: ['text/plain', 'text/html']
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: ['error', 'sent', 'pending']
  },
  addressesTo: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    validate: {
      isValidEmail: (arr) => arr.forEach(isValidEmail)
    }
  },
  namesTo: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  addressFrom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isValidEmail
    }
  },
  nameFrom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  sendgridMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isOpened: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isLinkClicked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  linkClickedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isBounced: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  bouncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isDropped: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  droppedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isDeferred: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  deferredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isSpam: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  spamAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  isProcessed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
});

export {
  EmailSchema
};

@inject({
  EmailSchema: () => EmailSchema,
  SequelizeConnector: () => SequelizeConnector,
  SendgridMailConnector: () => SendgridMailConnector,
  renderEmail: () => renderEmail,
  Promise: () => Promise,
  instantiate: () => instantiate,
  ensure: () => ensure,
  sequelize: () => sequelize
})
@throws({
  EmailNotFoundError,
  RecipientsRequiredError,
  RecipientNotFoundError,
  SenderRequiredError,
  SenderNotFoundError,
  EmailNotFoundError,
  EmailRedirectTokenMismatchError,
  EmailRedirectTokenAlreadyUsedError
})
export default class EmailModel extends BaseModel {
  constructor ({
    EmailSchema,
    SequelizeConnector,
    SendgridMailConnector,
    AWSS3Connector,
    renderEmail,
    Promise,
    instantiate,
    ensure,
    sequelize
  }, reqUser) {
    super(reqUser);

    this._sequelize = sequelize;
    this._sequelizeConnector = new SequelizeConnector(EmailSchema, 'id');
    this._sendgridMailConnector = new SendgridMailConnector();
    this._renderEmail = renderEmail;
    this._Promise = Promise;
    this._instantiate = instantiate;
    this._ensure = ensure;

    this.errors = EmailModel.errors;
  }

  get schema () {
    return this._sequelizeConnector.schema;
  }

  async _send (id) {

    log('looking up email with id "%s" for sending', id);

    const email = await this.findById(id);

    if (!email) {
      log('could not find email with id "%s" for _sendEmail call', id);

      const e = new EmailModel.errors.EmailNotFoundError({
        data: {
          id
        }
      });

      captureException(e);

      throw e;
    }

    const recipients = await email.getRecipients();

    log('found email with id "%s".  sending email', email.id);

    let sentAt = null;
    let status = null;
    let sendgridMessageId = null;
    try {
      log('Sending email: %O', {
        from: {
          addr: email.addressFrom,
          name: email.nameFrom
        },
        to: recipients.map((user, i) => ({
          addr: NODE_ENV !== 'production' ? 'development+'+i+'@jobstart.co' : user.email,
          name: user.name
        })),
        subject: email.subject,
        categories: email.categories
      });

      const r = await this._sendgridMailConnector.send({
        from: {
          addr: email.addressFrom,
          name: email.nameFrom
        },
        to: recipients.map((user, i) => ({
          addr: NODE_ENV !== 'production' ? 'development+'+i+'@jobstart.co' : user.email,
          name: user.name
        })),
        subject: email.subject,
        categories: email.categories,
        html: email.contentType === 'text/html' ? email.content : undefined,
        text: email.contentType === 'text/plain' ? email.content : undefined
      });
      sendgridMessageId = r.sendgridMessageId;
      status = 'sent';
      sentAt = new Date();
    } catch (e) { //NOTE: Use logger.trace instead
      log('error sending email', e);
      captureException(e);
      status = 'error';
    }

    log('updating email "%s" after send with status "%s", sentAt "%s", and sendgridMessageId "%s"', email.id, status, sentAt, sendgridMessageId);
    await email.update({
      status,
      sentAt,
      sendgridMessageId
    });

    log('updated email "%s" after send', email.id);
    return email;
  }

  @transaction
  async create (data, transactionContext) {
    const { transaction } = transactionContext;

    if (Object.prototype.toString.call(data.Recipients) !== '[object Array]') throw new EmailModel.errors.RecipientsRequiredError();
    if (!data.Sender) throw new EmailModel.errors.SenderRequiredError();

    const instantiateSender = this._instantiate(this._peerModels.User, {
      create: false
    });
    const instantiateRecipient = this._instantiate(this._peerModels.User, {
      create: false
    });

    const ensureSender = this._ensure(EmailModel.errors.SenderNotFoundError);
    const ensureRecipient = this._ensure(EmailModel.errors.RecipientNotFoundError);

    const contentType = typeof data.content === 'string' ? 'text/plain' : 'text/html';

    const [
      sender,
      recipients
    ] = await Promise.all([
      data.Sender.id ? ensureSender(instantiateSender(data.User, transactionContext)) : data.Sender,
      this._Promise.all(data.Recipients.map(user => user.id ? ensureRecipient(instantiateRecipient(user, transactionContext)) : user))
    ]);

    const addressFrom = sender.email;
    const nameFrom = sender.name;
    const addressesTo = recipients.map(user => user.email);
    const namesTo = recipients.map(user => user.name);

    const status = 'pending';

    const email = await this._sequelizeConnector.schema.create({
      ...data,
      addressFrom,
      nameFrom,
      addressesTo,
      namesTo,
      content: 'pending',
      contentType,
      status,
      redirectToken: data.redirectToken,
      redirectTokenUsed: data.redirectToken ? false : null,
      Sender: undefined,
      Recipients: undefined,
      id: undefined
    }, {
      transaction
    });

    const content = contentType !== 'text/html' ? data.content : this._renderEmail(data.content.component, {
      ...data.content.props,
      emailId: email.id,
      redirectToken: data.redirectToken || undefined
    });

    await email.update({
      content
    }, {
      transaction
    });

    let ops = [];

    if (this._peerModels.User.isInstance(sender)) ops.push(email.setSender(sender, {
      transaction
    }));

    const recipientModels = recipients.filter(user => this._peerModels.User.isInstance(user));

    if (recipientModels.length > 0) ops.push(email.setRecipients(recipientModels, {
      transaction
    }));

    await this._Promise.all(ops);

    email.Sender = sender;
    email.Recipients = recipients;

    log('sending email "%s" after transaction is committed', email.id);

    transactionContext.after().then(() => this._send(email.id));

    return email;
  }

  @transaction
  async markTokenUsed (redirectToken, transactionContext) {
    const { transaction } = transactionContext;

    const email = await this.findByRedirectToken(redirectToken, transactionContext)

    if (!email) throw new EmailModel.errors.EmailRedirectTokenMismatchError();
    if (email.redirectTokenUsed) throw new EmailModel.errors.EmailRedirectTokenAlreadyUsedError();

    log('marking email "%s" as having used it\'s redirect token', email.id);

    return email.update({
      redirectTokenUsed: true,
      redirectTokenUsedAt: new Date()
    }, {
      transaction
    });
  }

  async redirectTokenIsValid (redirectToken, transactionContext) {
    const email = await this.findByRedirectToken(redirectToken, transactionContext);

    return !!email;
  }

  async markAsProcessed (email, user, time, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isProcessed: true,
      processedAt: new Date(time)
    }, {
      transaction
    });

    log('email "%s" marked as processed', email.id);

    return email;
  }

  async markAsDropped (email, user, date, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isDropped: true,
      droppedAt: date
    }, {
      transaction
    });

    log('email "%s" marked as dropped', email.id);

    return email;
  }

  async markAsDelivered (email, user, date, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isDeferred: false,
      deferredAt: null,
      isDelivered: true,
      deliveredAt: date
    }, {
      transaction
    });

    log('email "%s" marked as delivered', email.id);

    return email;
  }

  async markAsDeferred (email, user, date, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isDeferred: true,
      deferredAt: date
    }, {
      transaction
    });

    log('email "%s" marked as deferred', email.id);

    return email;
  }

  async markAsBounced (email, user, date, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isBounced: true,
      bouncedAt: date
    }, {
      transaction
    });

    log('email "%s" marked as bounced');

    return email;
  }

  async markAsOpened (email, user, date, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isOpened: true,
      openedAt: date
    }, {
      transaction
    });

    log('email "%s" marked as opened');

    return email;
  }

  async markAsLinkClicked (email, user, date, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isLinkClicked: true,
      linkClickedAt: date
    }, {
      transaction
    });

    log('email "%s" marked as link clicked', email.id);

    return email;
  }

  @transaction
  async markAsSpam (email, user, date, transactionContext) {
    const { transaction } = transactionContext;
    email = this.isInstance(email) ? email : await this.findById(email.id || email, transactionContext);

    if (!email) {
      log('could not find email for markAsProcessed call');

      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      throw e;
    }

    await email.update({
      isSpam: true,
      spamAt: date
    }, {
      transaction
    });

    log('email "%s" marked as spam', email.id);

    return email;
  }

  findByRedirectToken (redirectToken, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findOne({
      where: {
        redirectToken,
        redirectTokenUsed: false
      },
      transaction
    });
  }

  createRedirectToken ({
    id,
    login = false,
    singleUse = true
  }) {
    return objectToToken({
      id,
      login,
      singleUse
    }, REDIRECT_JWT_SECRET);
  }

  async getRecipients (email, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;

    email = this.isInstance(email) ? email : this.findById(email.id || email, transactionContext);

    if (!email) {
      const e = new EmailModel.errors.EmailNotFoundError();

      captureException(e);

      log('could not find email for getRecipients call');

      throw e;
    }

    return await email.getRecipients({
      transaction
    });
  }

  findBySendgridMessageId(sendgridMessageId, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findOne({
      where: {
        sendgridMessageId
      },
      transaction
    });
  }

  findById (id, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findById(id, {
      transaction
    });
  }

  isInstance (subject) {
    return subject instanceof this._sequelizeConnector.schema.Instance;
  }

  rebuild (inst) {
    return this._sequelizeConnector.schema.build(inst, { isNewRecord: !inst.id });
  }
}
