import { expect } from 'chai';
import Promise from 'bluebird';
import { stub } from 'sinon';
import uuid from 'uuid';

import {
  createInvalidRedirectToken,
  createValidRedirectToken,
  validateAuthToken
} from '../helpers';

import getModels from '../../src/models';

import UserModel from '../../src/models/user';

describe('models/user', () => {
  let models = null
    , User = null
    , Email = null
    , nextStripeChargeListResponse = null
    , nextStripeCustomerCreateResponse = null
    , nextStripeCustomerUpdateResponse = null
    , nextStripeSubscriptionCreateResponse = null
    , nextStripeSubscriptionUpdateResponse = null
    , nextStripeSubscriptionDestroyResponse = null
    , nextTwilioSendMessageResponse = null
    , nextSlackSendMessageResponse = null;

  beforeEach(async () => {
    models = await getModels({});
    User = models.User;
    Email = models.Email;

    nextStripeChargeListResponse = [];
    nextStripeCustomerCreateResponse = {};
    nextStripeCustomerUpdateResponse = {};
    nextStripeSubscriptionCreateResponse = {};
    nextStripeSubscriptionUpdateResponse = {};
    nextStripeSubscriptionDestroyResponse = {};
    nextTwilioSendMessageResponse = {};
    nextSlackSendMessageResponse = {};

    stub(User._stripeChargeConnector, 'list', () => Promise.resolve(nextStripeChargeListResponse));
    stub(User._stripeCustomerConnector, 'create', () => Promise.resolve(nextStripeCustomerCreateResponse));
    stub(User._stripeCustomerConnector, 'update', () => Promise.resolve(nextStripeCustomerUpdateResponse));
    stub(User._stripeSubscriptionConnector, 'create', () => Promise.resolve(nextStripeSubscriptionCreateResponse));
    stub(User._stripeSubscriptionConnector, 'update', () => Promise.resolve(nextStripeSubscriptionUpdateResponse));
    stub(User._stripeSubscriptionConnector, 'destroy', () => Promise.resolve(nextStripeSubscriptionDestroyResponse));
    stub(User._twilioConnector, 'sendMessage', () => Promise.resolve(nextTwilioSendMessageResponse));
    stub(User._slackConnector, 'sendMessage', () => Promise.resolve(nextSlackSendMessageResponse));
    stub(User._pubsub, 'publish', () => Promise.resolve());
  });

  afterEach(async () => {
    Object.keys(models).forEach((k) => models[k].destructor());

    User._stripeChargeConnector.list.restore();
    User._stripeCustomerConnector.create.restore();
    User._stripeCustomerConnector.update.restore();
    User._stripeSubscriptionConnector.create.restore();
    User._stripeSubscriptionConnector.update.restore();
    User._stripeSubscriptionConnector.destroy.restore();
    User._twilioConnector.sendMessage.restore();
    User._slackConnector.sendMessage.restore();
    User._pubsub.publish.restore();

    await User.schema.destroy({
      where: {}
    });

    await Email.schema.destroy({
      where: {}
    });
  });

  describe('exchangeRedirectToken', () => {
    context('token is invalid', () => {
      let token = null;
      beforeEach(async () => {
        token = await createInvalidRedirectToken({
          id: uuid.v4()
        });
      });
      it('throws a ForbiddenError', async () => {
        try {
          await User.exchangeRedirectToken(token);
        } catch (e) {
          expect(e).to.be.instanceof(UserModel.errors.ForbiddenError);
        }
      });
    });
    context('token is not login capable', () => {
      let token = null;
      beforeEach(async () => {
        token = await createValidRedirectToken({
          id: uuid.v4(),
          login: false
        });
      });
      it('throws a ForbiddenError', async () => {
        try {
          await User.exchangeRedirectToken(token);
        } catch (e) {
          expect(e).to.be.instanceof(UserModel.errors.ForbiddenError);
        }
      });
    });
    context('token is single use', () => {
      let token = null;
      beforeEach(async () => {
        token = await createValidRedirectToken({
          id: uuid.v4(),
          singleUse: true,
          login: true
        });
        await Email.schema.create({
          content: 'foo bar',
          subject: 'foo',
          categories: ['foo'],
          scope: 'foo',
          redirectToken: token,
          redirectTokenUsed: false,
          contentType: 'text/plain',
          status: 'sent',
          addressesTo: ['foo@bar.com'],
          namesTo: ['foo bar'],
          addressFrom: 'bar@foo.com',
          nameFrom: 'bar foo'
        })
      });
      context('token has been used', () => {
        beforeEach(async () => {
          await Email.markTokenUsed(token)
        });
        it('throws a ForbiddenError', async () => {
          try {
            await User.exchangeRedirectToken(token);
          } catch (e) {
            expect(e).to.be.instanceof(UserModel.errors.ForbiddenError);
          }
        });
      });
    });
    context('matching user cannot be found', () => {
      let token = null;
      beforeEach(async () => {
        token = await createValidRedirectToken({
          id: uuid.v4(),
          singleUse: true,
          login: true
        });
        await Email.schema.create({
          content: 'foo bar',
          subject: 'foo',
          categories: ['foo'],
          scope: 'foo',
          redirectToken: token,
          redirectTokenUsed: false,
          contentType: 'text/plain',
          status: 'sent',
          addressesTo: ['foo@bar.com'],
          namesTo: ['foo bar'],
          addressFrom: 'bar@foo.com',
          nameFrom: 'bar foo'
        })
      });
      it('throws a UserNotFoundError', async () => {
        try {
          await User.exchangeRedirectToken(token);
        } catch (e) {
          expect(e).to.be.instanceof(UserModel.errors.UserNotFoundError);
        }
      });
    });
    context('is a valid redirect token', () => {
      let token = null
        , user = null;
      beforeEach(async () => {
        user = await User.schema.create({
          email: 'foo@bar.com'
        });
        token = await createValidRedirectToken({
          id: user.id,
          singleUse: true,
          login: true
        });
        await Email.schema.create({
          content: 'foo bar',
          subject: 'foo',
          categories: ['foo'],
          scope: 'foo',
          redirectToken: token,
          redirectTokenUsed: false,
          contentType: 'text/plain',
          status: 'sent',
          addressesTo: ['foo@bar.com'],
          namesTo: ['foo bar'],
          addressFrom: 'bar@foo.com',
          nameFrom: 'bar foo'
        })
      });
      it('returns a new auth token', async () => {
        const { token: authToken } = await User.exchangeRedirectToken(token);
        await validateAuthToken(authToken);
      });
    });
  });

  describe('signup', () => {
    context('invalid selected plan', () => {
      it('defaults the selected plan to performer', async () => {
        const user = await User.signup({
          email: 'foo@bar.com',
          selectedPlan: 'foo'
        });

        expect(user.selectedPlan).to.equal('performer');
      });
    });
    context('user already exists', () => {
      context('user is not finished with signup', () => {
        let user = null;
        beforeEach(async () => {
          user = await User.signup({
            email: 'foo@bar.com',
            selectedPlan: 'influencer',
            utmSource: 'foo'
          });
        });
        it('updates the user\'s selectedPlan only', async () => {
          const oldId = user.id;

          user = await User.signup({
            email: user.email,
            selectedPlan: 'achiever',
            utmSource: 'bar'
          });

          expect(user.selectedPlan).to.equal('achiever');
          expect(user.utmSource).to.equal('foo');
          expect(user.id).to.equal(oldId);
        });
      });
      context('user is finished with signup', () => {
        let user = null;
        beforeEach(async () => {
          user = await User.signup({
            email: 'foo@bar.com'
          });
          await user.update({
            signupComplete: true
          });
        });
        it('throws AlreadyRegisteredError', async () => {
          try {
            await User.signup({
              email: user.email,
              selectedPlan: 'achiever',
              utmSource: 'bar'
            });
          } catch (e) {
            expect(e).to.be.instanceof(UserModel.errors.AlreadyRegisteredError);
          }
        });
      });
    });
    context('user does not already exist', async () => {
      it('creates a new user', async () => {
        await User.signup({
          email: 'bar@foo.com'
        });
      });
    });
  });

  describe('completeSignup', () => {
    let user = null;
    beforeEach(async () => {
      user = await User.signup({
        email: 'foo@bar.com',
        selectedPlan: 'achiever'
      });
      stub(Email, 'create', () => Promise.resolve());
    });
    afterEach(async () => {
      Email.create.restore();
    });
    context('user exists', () => {
      it('sets the user\'s selected plan', async () => {
        await User.completeSignup({
          email: user.email,
          name: 'Foo Bar',
          password: 'abc123',
          selectedPlan: 'influencer'
        });

        await user.reload();

        expect(user.selectedPlan).to.equal('influencer');
      });
      it('sets the user\'s name', async () => {
        await User.completeSignup({
          email: user.email,
          name: 'Foo Bar',
          password: 'abc123',
          selectedPlan: 'influencer'
        });

        await user.reload();

        expect(user.name).to.equal('Foo Bar');

      });
      it('sets the user\'s hashed password for authentication', async () => {
        await User.completeSignup({
          email: user.email,
          name: 'Foo Bar',
          password: 'abc123',
          selectedPlan: 'influencer'
        });

        await user.reload();

        await User.login({
          email: user.email,
          password: 'abc123'
        });
      });
      it('sends the user a welcome email', async () => {
        await User.completeSignup({
          email: user.email,
          name: 'Foo Bar',
          password: 'abc123',
          selectedPlan: 'influencer'
        });

        expect(Email.create.firstCall.args[0].categories).to.eql([
          'SignupComplete'
        ]);
      });
      it('adds a valid auth token to the result', () => {

      });
    });
    context('user does not exist', () => {
      it('throws a UserNotFoundError', () => {

      });
    });
  });

  describe('updateProfile', () => {

  });

  describe('updateSettings', () => {

  });

  describe('addActiveTopic', () => {

  });

  describe('cancelActiveTopic', () => {

  });

  describe('completeActiveTopic', () => {

  });

  describe('updatePlan', () => {

  });

  describe('cancelPlan', () => {

  });

  describe('updateBilling', () => {

  });
});
