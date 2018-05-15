import { inject } from 'injectorator';
import _ from 'underscore';
import Promise from 'bluebird';
import Sequelize from 'sequelize';
import uuid from 'uuid';
import debug from 'debug';
import payment from 'payment';
import iplocation from 'iplocation';
import moment from 'moment';

import {
  REDIRECT_JWT_SECRET
} from '../../config/environment';

import pubsub from '../io/pubsub';
import { increment } from '../io/statsd';
import sequelize from '../io/postgres';
import { captureException } from '../io/raven';

import createLock from '../functions/createLock';
import instantiate from '../functions/instantiate';
import ensure from '../functions/ensure';
import { isValidEmail } from '../functions/validators';

import {
  makeSaltedHash,
  compareSaltedHash,
  objectToToken,
  tokenToObject
} from '../lib/crypto';

import throws from '../decorators/throws';
import transaction from '../decorators/transaction';

import BaseModel from './base';

import ElasticSearchConnector from '../connectors/elasticsearch';
import SequelizeConnector, { createSchema as createSequelizeSchema, DataTypes } from '../connectors/sequelize';
import SlackConnector from '../connectors/slack';
import TwilioConnector from '../connectors/twilio';
import StripeChargeConnector from '../connectors/stripe/charge';
import StripeCustomerConnector from '../connectors/stripe/customer';
import StripeSubscriptionConnector from '../connectors/stripe/subscription';

import { UserNotFoundError } from '../errors/internal';
import {
  LoginFailedError,
  IssueUpdatingBillingError,
  CardNameRequiredError,
  CardNumberRequiredError,
  CardExpMonthRequiredError,
  CardExpYearRequiredError,
  CardCVCRequiredError,
  InvalidCardError,
  EmailRedirectTokenAlreadyUsedError,
  UserIncorrectPasswordError,
  AlreadyRegisteredError,
  PhoneNumberRequiredError,
  PhoneNumberAlreadyUsedError,
  CouponCodeNotFoundError,
  ForbiddenError
} from '../errors/functional';

import signupCompleteEmail from '../emails/templates/signupComplete';
import resetPasswordEmail from '../emails/templates/resetPassword';

const log = debug('graphql:models:user');

const USER_CONVERTED_SLACK_CHANNEL = 'app-conversions';
const USER_CANCELLED_SLACK_CHANNEL = 'app-cancellations';

const { schema: UserSchema } = createSequelizeSchema('User', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isValidEmail
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    defaultValue: null
  },

  hashedPassword: DataTypes.STRING,

  signupComplete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  utmSource: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true
  },
  utmMedium: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true
  },
  utmCampaign: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true
  },
  utmContent: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true
  },

  emailSubscribed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  smsSubscribed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  selectedPlan: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  selectedPlanUpdatedAt: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },

  lastActivityAt: {
    type: DataTypes.DATE
  },

  stripeCardLast4: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  stripeCardType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  stripeCustomerCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  stripeCustomerUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },

  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  stripeSubscriptionCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  stripeSubscriptionUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  stripeSubscriptionDestroyedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  stripeLastPaymentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  billingPaidUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  hasConnectedBilling: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  hasInvalidBilling: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  // NOTE: token is a stub value for serialization
  // NEVER save actual token in DB
  token: {
    type: DataTypes.VIRTUAL
  },
});

export {
  UserSchema
};

@inject({
  UserSchema: () => UserSchema,
  SequelizeConnector: () => SequelizeConnector,
  StripeChargeConnector: () => StripeChargeConnector,
  StripeCustomerConnector: () => StripeCustomerConnector,
  StripeSubscriptionConnector: () => StripeSubscriptionConnector,
  ElasticSearchConnector: () => ElasticSearchConnector,
  TwilioConnector: () => TwilioConnector,
  SlackConnector: () => SlackConnector,
  sequelize: () => sequelize,
  Promise: () => Promise,
  instantiate: () => instantiate,
  ensure: () => ensure,
  compareSaltedHash: () => compareSaltedHash,
  makeSaltedHash: () => makeSaltedHash,
  objectToToken: () => objectToToken,
  tokenToObject: () => tokenToObject,
  captureException: () => captureException,
  pubsub: () => pubsub
})
@throws({
  UserNotFoundError,
  AlreadyRegisteredError,
  LoginFailedError,
  IssueUpdatingBillingError,
  CardNameRequiredError,
  CardNumberRequiredError,
  CardExpMonthRequiredError,
  CardExpYearRequiredError,
  CardCVCRequiredError,
  InvalidCardError,
  UserIncorrectPasswordError,
  EmailRedirectTokenAlreadyUsedError,
  CouponCodeNotFoundError,
  ForbiddenError,
  PhoneNumberRequiredError,
  PhoneNumberAlreadyUsedError
})
export default class UserModel extends BaseModel {
  constructor ({
    UserSchema,
    SequelizeConnector,
    StripeChargeConnector,
    StripeCustomerConnector,
    StripeSubscriptionConnector,
    ElasticSearchConnector,
    TwilioConnector,
    SlackConnector,
    sequelize,
    Promise,
    instantiate,
    ensure,
    compareSaltedHash,
    makeSaltedHash,
    objectToToken,
    tokenToObject,
    captureException,
    pubsub
  }, reqUser) {
    super(reqUser);

    this._reqUser = reqUser;

    this._schema = UserSchema;

    this._elasticSearchConnector = new ElasticSearchConnector('users', {
      id: {
        type: 'string',
        index: 'not_analyzed'
      },
      name: {
        type: 'string'
      }
    });

    this._sequelizeConnector = new SequelizeConnector(UserSchema, 'id');

    this._stripeChargeConnector = new StripeChargeConnector();

    this._stripeCustomerConnector = new StripeCustomerConnector();

    this._stripeSubscriptionConnector = new StripeSubscriptionConnector();

    this._twilioConnector = new TwilioConnector();

    this._slackConnector = new SlackConnector();

    this._sequelize = sequelize;

    this._Promise = Promise;

    this._instantiate = instantiate;

    this._ensure = ensure;

    this._compareSaltedHash = compareSaltedHash;

    this._makeSaltedHash = makeSaltedHash;

    this._objectToToken = objectToToken;

    this._tokenToObject = tokenToObject;

    this._captureException = captureException;

    this._pubsub = pubsub;
  }

  get schema () {
    return this._schema;
  }

  toToken (user) {
    return this._objectToToken({
      id: user.id.toString()
    });
  }

  async fromToken (token, transactionContext) {
    try {
      const { id } = await this._tokenToObject(token);
      return this.findById(id, transactionContext);
    } catch (e) {
      this._captureException(e, this._reqUser);
      return null;
    }
  }

  _publish (user) {
    user = user.toJSON();
    this._pubsub.publish('userChannel', user);
  }

  _createElasticSearchDocument (user) {
    return {
      id: user.id,
      name: user.name
    };
  }

  @transaction
  async exchangeRedirectToken (redirectToken, transactionContext) {
    let id = null
      , login = null
      , singleUse = null;

    try {
      const res = await tokenToObject(redirectToken, REDIRECT_JWT_SECRET);
      id = res.id;
      login = res.login;
      singleUse = res.singleUse || false;
    } catch (e) {
      log('error exchanging redirect token', e);
      throw new UserModel.errors.ForbiddenError();
    }

    if (!login) {
      log('redirect token is not login capable');
      const e = new UserModel.errors.ForbiddenError();
      captureException(e);
      throw e;
    }

    if (singleUse) {
      const { Email } = this._peerModels;

      const email = await Email.findByRedirectToken(redirectToken, transactionContext);

      if (!email) {
        log('redirect token for supposed user "%s" either does not exist or has already been used', id);
        throw new UserModel.errors.ForbiddenError();
      }

      await Email.markTokenUsed(redirectToken, transactionContext);
    }

    const user = await this.findById(id, transactionContext);

    if (!user) {
      log('could not find user "%s" for redirect token exchange', id);
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    user.token = await this.toToken(user);

    return user;
  }

  @transaction
  async signup (data, ipAddress = null, transactionContext) {
    const { transaction } = transactionContext;

    const {
      email,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent
    } = data;

    let user = await this._sequelizeConnector.schema.findOne({
      where: {
        email
      },
      transaction
    });

    if (user && user.signupComplete) throw new UserModel.errors.AlreadyRegisteredError();

    user = await this._sequelizeConnector.schema.create({
      email,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent
    }, {
      transaction
    });

    if (ipAddress) {
      // Ip address might have IPv6 and IPv4 in it, so ensure you just use one of them
      if (~ipAddress.indexOf(',')) ipAddress = ipAddress.split(',')[0];

      transactionContext.after().then(() => {
        iplocation(ipAddress, (err, res) => {
          // Only let United States users and ip addresses book a call
          if (!err && res && res.country_code !== 'US' && res.country_code !== '') {
            user.update({ hasBookedOrSkippedOnboardingCall: true });
          }

          if (res && res.country_code && res.city) {
            let location = res.city;
            if (res.region_name) location = location + ', ' + res.region_name;
            if (res.country_name && res.country_name !== 'United States') location = location + ', ' + res.country_name;
            this._peerModels.UserProperty.createOrUpdateForUser(user, 'Current location', location);
          }
        });
      });
    }

    transactionContext.after().then(() => {
      this._elasticSearchConnector.index(user.id, this._createElasticSearchDocument(user));
    });

    return user;
  }

  @transaction
  async completeSignup (data, transactionContext) {
    const { transaction } = transactionContext;

    log('running complete signup %O', data);

    const { email, name, password, phoneNumber } = data;

    if (!phoneNumber) throw new UserModel.errors.PhoneNumberRequiredError();

    const userWithPhone = await this._sequelizeConnector.schema.findOne({
      where: {
        phoneNumber
      },
      transaction
    });

    if (userWithPhone) throw new UserModel.errors.PhoneNumberAlreadyUsedError();

    const [ n, rows = [] ] = await this._sequelizeConnector.schema.update({
      name,
      phoneNumber,
      hashedPassword: await makeSaltedHash(password),
      signupComplete: true
    }, {
      returning: true,
      where: {
        email,
        signupComplete: false
      },
      transaction
    });

    const [ user ] = rows;
    if (!user) {
      throw new UserModel.errors.UserNotFoundError();
    }

    let ops = [
      this._objectToToken({
        id: user.id
      }),
      this._peerModels.Email.create({
        content: {
          component: signupCompleteEmail
        },
        subject: `Welcome to OurApp`,
        categories: [
          'SignupComplete'
        ],
        scope: user.id,
        Recipients: [
          user
        ],
        Sender: {
          email: 'team@ourapp.com',
          name: 'OurApp'
        }
      }, transactionContext)
    ];

    const [ token ] = await this._Promise.all(ops);

    user.token = token;

    log('returning from complete signup');

    transactionContext.after().then(() => {
      this._elasticSearchConnector.index(user.id, this._createElasticSearchDocument(user));
    });

    return user;
  }

  async login ({ email, password }) {
    log('attempting to log in user with email %s', email);

    const user = await this.findByEmail(email);

    if (!user) {
      log('could not find user with email %s', email);
      throw new UserModel.errors.LoginFailedError();
    } else if (!user.signupComplete) {
      log('user has not finished signup %s', email);
      throw new UserModel.errors.LoginFailedError();
    }

    const [
      authenticated,
      token
    ] = await this._Promise.all([
      this._compareSaltedHash(password, user.hashedPassword),
      this.toToken(user)
    ]);

    if (!authenticated) {
      log('invalid password for user with email %s', email);
      throw new UserModel.errors.LoginFailedError();
    }

    user.token = token;

    return user;
  }

  async spoof ({ email }) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    user.token = await this.toToken(user);
    return user;
  }

  @transaction
  async updateProfile (user, data, transactionContext) {
    const {
      name = undefined,
      email = undefined,
      phoneNumber = undefined,
      Avatar = null,
      CurrentLocation = null
    } = data;

    const { transaction } = transactionContext;

    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('could not find user for updateProfile call');
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    log('updating profile of user "%s"', user.id);

    const { File, Location } = this._peerModels;

    let d = {};

    if (name) d.name = name;
    if (email) d.email = email;
    if (phoneNumber) d.phoneNumber = phoneNumber;

    let ops = [];

    if (Object.keys(d).length > 0) {
      ops.push(
        user.update(d, {
          transaction
        })
      );
    } else {
      ops.push(user);
    }

    if (Avatar && !Avatar.id) {
      log('creating new avatar file for user "%s"', user.id);
      ops.push(
        File.create({
          content: Avatar.content,
          key: `user-${user.id}-avatar-${uuid.v4()}`
        }, transactionContext)
      );
    } else {
      ops.push(null);
    }

    if (CurrentLocation && !CurrentLocation.id) {
      log('binding new currentLocation location for user "%s"', user.id);
      ops.push(
        Location.create(CurrentLocation, transactionContext)
      );
    } else {
      ops.push(null);
    }

    const [
      _u,
      avatar,
      currentLocation
    ] = await this._Promise.all(ops);

    ops = [];

    if (avatar) {
      log('setting avatar "%s" for User "%s"', avatar.id, user.id);
      ops.push(user.setAvatar(avatar, {
        transaction
      }));
    }

    if (currentLocation) {
      log('setting currentLocation "%s" for user "%s"', currentLocation.id, user.id);
      ops.push(user.setCurrentLocation(currentLocation, {
        transaction
      }));
    }

    await this._Promise.all(ops);

    transactionContext.after().then(() => this._publish(user));
    transactionContext.after().then(() => {
      this._elasticSearchConnector.index(user.id, this._createElasticSearchDocument(user));
    });

    return user;
  }

  @transaction
  async updateAvatar (user, file, transactionContext) {
    const { transaction } = transactionContext;

    const { File } = this._peerModels;

    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext)

    if (!user) {
      log('coult not find user for updateAvatar call');
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    const {
      originalname,
      mimetype
    } = file;

    const ext = originalname.split('.').pop();

    const key = `user-${user.id}-avatar-${uuid.v4()}.${ext}`;

    const avatar = await File.create({
      file,
      key,
      ext
    }, transactionContext);

    await user.setAvatar(avatar, {
      transaction
    });

    transactionContext.after().then(() => this._publish(user));

    return user;
  }

  @transaction
  async updateSettings (user, {
    emailSubscribed = undefined,
    smsSubscribed = undefined
  }, transactionContext) {
    const { transaction } = transactionContext;

    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext)

    if (!user) {
      log('could not find user for updateSettings call');
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    log('updating settings for user "%s"', user.id);

    let data = {};

    if (emailSubscribed !== undefined) data.emailSubscribed = Boolean(emailSubscribed);
    if (smsSubscribed !== undefined) data.smsSubscribed = Boolean(smsSubscribed);

    if (Object.keys(data).length < 1) return user;

    await user.update(data, {
      transaction
    });

    transactionContext.after().then(() => this._publish(user));

    return user;
  }

  @transaction
  async enableSMS (user, {
    phoneNumber = undefined
  }, transactionContext) {
    const { transaction } = transactionContext;

    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext)

    if (!user) {
      log('could not find user for enable SMS seen call');
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    log('enabling SMS for user "%s"', user.id);

    await user.update({
      smsSubscribed: true,
      phoneNumber
    }, {
      transaction
    });

    await this._twilioConnector.sendMessage({
      to: user.phoneNumber,
      body: 'You have successfully connected to SMS!'
    });

    transactionContext.after().then(() => this._publish(user));

    return user;
  }

  async updateLastActivityAt (user, lastActivityAt, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('updateLastActivityAt could not find user with id "%s"', user.id || user || 'undefined');
      return null;
    }

    await user.update({
      lastActivityAt
    }, {
      transaction
    });

    if (transactionContext) {
      transactionContext.after().then(() => this._publish(user));
    } else {
      this._publish(user);
    }

    return user;
  }

  async getCurrentLocation (user, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('unable to find user for getCurrentLocation call');
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    if (!user.CurrentLocationId) return null;
    if (user.CurrentLocation && user.CurrentLocation.id) return user.CurrentLocation;

    const { Location } = this._peerModels;

    const currentLocation = await Location.findById(user.CurrentLocationId, transactionContext);

    return currentLocation || null;
  }

  async getAvatar (user, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('unable to find user for getAvatar call');
      const e = new UserModel.errors.UserNotFoundError();

      captureException(e);

      throw e;
    }

    if (!user.AvatarId) return null;
    if (user.Avatar && user.Avatar.id) return user.Avatar;

    const { File } = this._peerModels;

    const avatar = await File.findById(user.AvatarId, transactionContext);

    return avatar || null;
  }

  @transaction
  async updatePlan (user, selectedPlan, transactionContext) {
    const { transaction } = transactionContext;

    let lock = null;

    if (user) {
      lock = createLock(user.id || user, 'user_update_plan', 60);
      try {
        log('attempting to lock updatePlan call for user "%s"', user.id || user);
        await lock.lock();
      } catch (e) {
        log('could not lock updatePlan call for user "%s", returning null', user.id || user);
        return null;
      }
    }

    try {
      user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

      if (!user) {
        log('unable to find user for updatePlan call');
        const e = new UserModel.errors.UserNotFoundError();
        captureException(e);
        throw e;
      }

      log('user selected pay later plan - sending slack messsage "%s"', user.id || user);
      this._slackConnector.sendMessage({
        channel: USER_CONVERTED_SLACK_CHANNEL,
        text: `${user.name} - ${user.email} - selected the pay later plan -> https://app.pandadoc.com/a/#/templates/kPEhYgXgwuqHapowy8uEcY/widgets`
      });

      log('user selected pay later plan - updating user "%s"', user.id || user);

      await user.update({
        selectedPlan,
        selectedPlanUpdatedAt: Date.now()
      }, {
        transaction
      });

      return user;
    } catch (e) {
      try {
        log('unlocking updatePlan call for user "%s"', user.id || user);
        await lock.unlock();
      } catch (e) {
        log('could not unlock updatePlan call for user "%s"', user.id || user);
        captureException(e);
      }

      throw e;
    }
  }

  @transaction
  async cancelPlan (user, transactionContext) {
    const { transaction } = transactionContext;

    let lock = null;

    if (user) {
      lock = createLock(user.id || user, 'user_cancel_plan', 60);
      try {
        log('attempting to lock cancelPlan call for user "%s"', user.id || user);
        await lock.lock();
      } catch (e) {
        log('could not lock cancelPlan call for user "%s", returning null', user.id || user);
        return null;
      }
    }

    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('unable to find user for cancelPlan call');
      const e = new UserModel.errors.UserNotFoundError();
      captureException(e);
      throw e;
    }

    if (!user.stripeCustomerId || !user.stripeSubscriptionId) {
      log('User %s has not yet entered billing information with a subscriptions - no plan to cancel.  Modifying only selectedPlan property', user.id);
      return await user.update({
        selectedPlan: null,
        selectedPlanUpdatedAt: Date.now()
      }, {
        transaction
      });
    }

    try {
      log('User %s has a stripe subscription. Destroying it', user.id);
      await this._stripeSubscriptionConnector.destroy({
        subscriptionId: user.stripeSubscriptionId
      });
      const existingSelectedPlan = user.selectedPlan;
      transactionContext.after().then(() => this._slackConnector.sendMessage({
        channel: USER_CANCELLED_SLACK_CHANNEL,
        text: `${user.name} (${user.id}) just cancelled their paid plan "${existingSelectedPlan}"`
      }));
    } catch (e) {
      captureException(e);
      throw new IssueUpdatingBillingError({
        message: 'There was an issue canceling your plan. Please contact us at support@ourapp.com'
      });
    }

    log('updating User %s with no plan data', user.id);

    await user.update({
      stripeSubscriptionId: null,
      stripeSubscriptionUpdatedAt: null,
      stripeSubscriptionCreatedAt: null,
      stripeSubscriptionDestroyedAt: Date.now(),
      selectedPlan: null,
      selectedPlanUpdatedAt: Date.now()
    }, {
      transaction
    });

    try {
      log('unlocking cancelPlan call for user "%s"', user.id || user);
      await lock.unlock();
    } catch (e) {
      log('could not unlock cancelPlan call for user "%s"', user.id || user);
      captureException(e);
    }

    transactionContext.after().then(() => this._publish(user));
    transactionContext.after().then(() => this._peerModels.Message.createStatusMessage({
      user,
      origin: 'boost',
      internal: true,
      skipNotification: true,
      text: user.name.split(' ')[0] + ' canceled their plan, and has access to boost until ' + moment(user.billingPaidUntil).format('MM/DD/YYYY')
    }));

    return user;
  }

  @transaction
  async updateBilling (user, {
    stripeCardName,
    stripeCardNumber,
    stripeCardExp,
    stripeCardCVC,
    couponCode = ''
  }, transactionContext) {
    const { transaction } = transactionContext;

    let lock = null;

    if (user) {
      lock = createLock(user.id || user, 'user_update_billing', 60);
      try {
        log('attempting to lock updateBilling call for user "%s"', user.id || user);
        await lock.lock();
      } catch (e) {
        log('could not lock updateBilling call for user "%s", returning null', user.id || user);
        return null;
      }
    }

    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    try {
      if (!user) {
        log('could not find user for updateBilling call');

        const e = new UserModel.errors.UserNotFoundError();

        captureException(e);

        throw e;
      }

      const {
        month: stripeCardExpMonth,
        year: stripeCardExpYear
      } = stripeCardExp;

      if (!stripeCardName) throw new UserModel.errors.CardNameRequiredError();
      if (!stripeCardNumber) throw new UserModel.errors.CardNumberRequiredError();
      if (!stripeCardExpMonth) throw new UserModel.errors.CardExpMonthRequiredError();
      if (!stripeCardExpYear) throw new UserModel.errors.CardExpYearRequiredError();
      if (!stripeCardCVC) throw new UserModel.errors.CardCVCRequiredError();

      let isNewStripeCustomer = false
        , stripeCustomerId = user.stripeCustomerId || null;

      try {
        if (stripeCustomerId) {
          await this._stripeCustomerConnector.update(stripeCustomerId, {
            name: stripeCardName,
            number: stripeCardNumber,
            exp_month: stripeCardExpMonth,
            exp_year: stripeCardExpYear,
            cvc: stripeCardCVC
          });
        } else {
          isNewStripeCustomer = true;
          let stripeCustomer = await this._stripeCustomerConnector.create({
            name: user.name,
            email: user.email,
            userId: user.id
          }, {
            name: stripeCardName,
            number: stripeCardNumber,
            exp_month: stripeCardExpMonth,
            exp_year: stripeCardExpYear,
            cvc: stripeCardCVC
          });
          stripeCustomerId = stripeCustomer.id;
        }
      } catch (e) {
        throw new UserModel.errors.InvalidCardError();
      }

      const stripeCardLast4 = stripeCardNumber.substr(stripeCardNumber.length - 4);
      const stripeCardType = payment.fns.cardType(stripeCardNumber);
      const stripeCustomerCreatedAt = isNewStripeCustomer ? Date.now() : undefined;
      const stripeCustomerUpdatedAt = Date.now();
      const hasConnectedBilling = true;

      await user.update({
        selectedPlanUpdatedAt: Date.now(),
        selectedPlan: 'salaryUpfront995',
        archived: false,
        archivedAt: null,
        stripeCardLast4,
        stripeCardType,
        stripeCustomerCreatedAt,
        stripeCustomerUpdatedAt,
        stripeCustomerId,
        hasConnectedBilling
      }, {
        transaction
      });

      if (!user.paidUpfrontCompleted) {
        transactionContext.after().then(async () => {
          try {
            // MAKE THE TRANSACTION
            const charge = await this._stripeChargeConnector.create({
              stripeChargeAmount: 995 * 100,
              stripeChargeDescription: 'Jobstart Salary Negotiation - Paid Upfront',
              stripeCustomerId: user.stripeCustomerId
            });

            await user.update({
              paidUpfrontCompleted: true,
              stripeLastPaymentAt: Date.now()
            }, {
              transaction
            });

            this._slackConnector.sendMessage({
              channel: USER_CONVERTED_SLACK_CHANNEL,
              text: `${user.name} (${user.id}) just paid $995 upfront`
            });
          } catch (e) {
            captureException(e);
          }
        });
      }

      try {
        log('unlocking updateBilling call for user "%s"', user.id || user);
        await lock.unlock();
      } catch (e) {
        log('could not unlock updateBilling call for user "%s"', user.id || user);
        captureException(e);
      }

      transactionContext.after().then(() => this._publish(user));

      return user;
    } catch (e) {
      try {
        log('unlocking updateBilling call for user "%s"', user.id || user);
        await lock.unlock();
      } catch (e) {
        log('could not unlock updateBilling call for user "%s"', user.id || user);
        captureException(e);
      }
      throw e;
    }
  }

  @transaction
  async paymentSucceeded (stripeCustomerId, date = moment().unix(), transactionContext) {
    const { transaction } = transactionContext;

    const user = await this._sequelizeConnector.schema.findOne({
      where: {
        stripeCustomerId
      },
      transaction
    });

    if (!user) {
      const e = new UserModel.errors.UserNotFoundError({
        data: {
          stripeCustomerId
        }
      });

      log('could not find user with stripeCustomerId "%s" for paymentSucceeded call', stripeCustomerId);

      captureException(e);

      throw e;
    }

    const mDate = moment.unix(date);

    log('payment succeeded for user "%s" with stripeCustomerId "%s"', user.id, stripeCustomerId);

    const stripeLastPaymentAt = mDate.toISOString();

    // Increment billing paid until. If user hasn't paid until a date yet, they
    // are on the free trial and only increment 3 weeks instead of a month
    const billingPaidUntil = user.billingPaidUntil ? mDate.add(1, 'month').toISOString() : mDate.add(3, 'week').toISOString();

    log('updating stripeLastPaymentAt to %s for user "%s"', stripeLastPaymentAt, user.id);
    log('updating billingPaidUntil to %s for user "%s"', billingPaidUntil, user.id);

    await user.update({
      stripeLastPaymentAt,
      billingPaidUntil
    }, {
      transaction
    });

    transactionContext.after().then(() => this._publish(user));
    transactionContext.after().then(() => this._peerModels.Message.createStatusMessage({
      user,
      origin: 'boost',
      internal: true,
      skipNotification: true,
      text: user.name.split(' ')[0] + ' paid, and will have access until ' + moment(billingPaidUntil).format('MM/DD/YYYY')
    }));

    return user;
  }

  async paymentFailed (stripeCustomerId, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;

    const user = await this._sequelizeConnector.schema.findOne({
      where: {
        stripeCustomerId
      },
      transaction
    });

    if (!user) {
      const e = new UserModel.errors.UserNotFoundError();

      log('could not find user with stripeCustomerId "%s" for paymentFailed call', stripeCustomerId);

      captureException(e);

      throw e;
    }

    log('payment failed for user "%s" with stripeCustomerId "%s"', user.id, stripeCustomerId);

    log('updating hasInvalidBilling to true for user "%s"', user.id);

    await user.update({
      hasInvalidBilling: true
    }, {
      transaction
    });

    if (transactionContext) {
      transactionContext.after().then(() => this._publish(user));
      transactionContext.after().then(() => this._peerModels.Message.createStatusMessage({
        user,
        origin: 'boost',
        internal: false,
        skipNotification: false,
        text: 'A payment attempt has just failed. Please ensure your credit card information is accurate and up-to-date to continue.'
      }));
    } else {
      this._publish(user);
    }

    return user;
  }

  async changePassword (user, password, token, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('cannot find user for changePassword call');

      const e = new UserModel.errors.UserNotFoundError();

      captureException(e);

      throw e;
    }

    log('changing password for user "%s"', user.id);

    await this._Promise.all([
      user.update({
        hashedPassword: await makeSaltedHash(password)
      }, {
        transaction
      }),
      token ? this._peerModels.Email.markTokenUsed(token) : null
    ]);

    if (transactionContext) {
      transactionContext.after().then(() => this._publish(user));
    } else {
      this._publish(user);
    }

    return user;
  }

  async forgotPassword (email, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    const user = await this._sequelizeConnector.schema.findOne({
      where: {
        email
      },
      transaction
    });

    const { Email } = this._peerModels;

    if (!user) {
      log('could not find user with email "%s" for forgotPassword call', email);
      return true;
    }

    log('found user "%s" with email "%s" for forgotPassword call', user.id, email);

    const redirectToken = await Email.createRedirectToken({
      id: user.id
    });

    await Email.create({
      redirectToken,
      content: {
        component: resetPasswordEmail
      },
      subject: `Reset Password`,
      categories: [
        'ResetPassword'
      ],
      scope: user.id,
      Recipients: [
        user
      ],
      Sender: {
        email: 'team@ourapp.com',
        name: 'OurApp'
      }
    }, transactionContext);

    if (transactionContext) {
      transactionContext.after().then(() => this._publish(user));
    } else {
      this._publish(user);
    }

    return true;
  }

  async loggedChangePassword (user, oldPassword, newPassword, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('cannot find user for loggedChangePassword call');

      const e = new UserModel.errors.UserNotFoundError();

      captureException(e);

      throw e;
    }

    const isOldPassAccurate = await this._compareSaltedHash(oldPassword, user.hashedPassword);

    if (!isOldPassAccurate) {
      throw new UserModel.errors.UserIncorrectPasswordError();
    }

    log('changing password for user "%s"', user.id);

    await user.update({
      hashedPassword: await makeSaltedHash(newPassword)
    }, {
      transaction
    });

    if (transactionContext) {
      transactionContext.after().then(() => this._publish(user));
    } else {
      this._publish(user);
    }

    return user;
  }

  async getTransactions (user, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    user = this.isInstance(user) ? user : await this.findById(user.id || user, transactionContext);

    if (!user) {
      log('cannot find user for getCharges call');

      const e = new UserModel.errors.UserNotFoundError();

      captureException(e);

      throw e;
    }

    if (!user.stripeCustomerId) {
      return [];
    }

    try {
      const charges = await this._stripeChargeConnector.list(user.stripeCustomerId);
      log('getCharges found %s charges for user %s', charges.length, user.id);
      return charges;
    } catch (e) {
      if (__TEST__ || __DEV__) {
        return [];
      }
      throw e;
    }
  }

  async indexAll (transaction, offset = 0) {
    if (offset === 0) {
      try {
        await this._elasticSearchConnector.reset(); //remove the existing index so that it will be recreated
      } catch (e) {
        log('error removing existing index while indexing all documents: %O', e);
      }
    }

    const limit = 2;

    const users = await this._sequelizeConnector.schema.findAll({
      where: {
        destroyed: false
      },
      offset,
      limit,
      transaction
    });

    await Promise.all(users.map(
      u => this._elasticSearchConnector.index(u.id, this._createElasticSearchDocument(u))
    ));

    return users.length === limit ? users.concat(await this.indexAll(transaction, offset + limit)) : users;
  }

  @transaction
  async search ({ queryString = '', offset = 0 }, transactionContext) {
    const { transaction } = transactionContext;

    const searchResults = await this._elasticSearchConnector.search({
      multi_match: {
        query: queryString,
        fields: ['name']
      }
    }, {
      from: offset,
      size: 10
    });

    return this._sequelizeConnector.schema.findAll({
      where: {
        id: {
          $in: _.pluck(searchResults, 'id')
        }
      },
      transaction
    });
  }

  findByPhoneNumber (phoneNumber, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findOne({
      where: {
        phoneNumber,
        destroyed: false
      },
      transaction
    });
  }

  findById (id, transactionContext, include = []) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findById(id, {
      transaction,
      include
    });
  }

  async findByForgotPasswordToken (token, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    const { Email } = this._peerModels;

    const email = await Email.findByRedirectToken(token);

    if (!email) {
      throw new UserModel.errors.EmailRedirectTokenAlreadyUsedError();
    }

    const [ user ] = await Email.getRecipients(email, transactionContext);

    return user || null;
  }

  findByEmail (email, transactionContext, include = []) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findOne({
      where: {
        email
      },
      transaction,
      include
    });
  }

  isInstance (subject) {
    return subject instanceof this._sequelizeConnector.schema.Instance;
  }

  rebuild (inst) {
    return this._sequelizeConnector.schema.build(inst, { isNewRecord: !inst.id });
  }
}
