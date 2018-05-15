import {
  isNotAuthenticatedResolver,
  isAuthenticatedResolver,
  isAdminResolver,
  baseResolver
} from './_base';

import {
  LoginFailedError,
  ForbiddenError
} from '../errors/functional';

import {
  UserNotFoundError
} from '../errors/internal';

import {
  InvalidEmailError,
  InvalidPasswordError,
  InvalidPhoneNumberError,
  InvalidCreditCardNumberError,
  InvalidCreditCardExpirationError,
  InvalidCreditCardCVCError,
  InvalidUrlError
} from '../errors/validation';

import {
  INVALID_VALUE
} from '../constants';

// Queries /////////////////////

const getMyUser = baseResolver.createResolver(
  (r, a, { user }) => user || null
);

const searchUsers = isAdminResolver.createResolver(
  (root, { input: { query = '', offset = 0 } }, { models: User }) => User.search({ queryString: query, offset })
);

// Mutations ///////////////////

export const userSignup = isNotAuthenticatedResolver.createResolver(
  async (root, { input }, context) => {
    const { models: { User } } = context;

    if (input.email === INVALID_VALUE) throw new InvalidEmailError();

    const user = await User.signup(input, context && context.ip);

    context.user = user;

    return user;
  }
)
.requireArgs({
  'input.email': 'Please enter a valid email address'
});

const userCompleteSignup = isNotAuthenticatedResolver.createResolver(
  async (root, { input }, context) => {
    const { models: { User } } = context;

    if (input.password === INVALID_VALUE) throw new InvalidPasswordError();

    const user = await User.completeSignup(input);

    context.user = user;

    return user;
  }
)
.requireArgs({
  'input.password': 'Please enter a password',
  'input.name': 'Please enter your name',
  'input.phoneNumber': 'Please enter your phone number',
});

const userLogin = isNotAuthenticatedResolver.createResolver(
  async (root, { input }, context) => {
    const { models: { User } } = context;
    const user = await User.login(input);
    context.user = user;
    return user;
  }
);

const userUpdatePlan = isAuthenticatedResolver.createResolver(
  (root, { input: { selectedPlan } }, { user, models: { User } }) => User.updatePlan(user, selectedPlan)
);

const userCancelPlan = isAuthenticatedResolver.createResolver(
  (root, input, { user, models: { User } }) => User.cancelPlan(user)
);

const userUpdateBilling = isAuthenticatedResolver.createResolver(
  (root, { input: {
    stripeCardName,
    stripeCardNumber,
    stripeCardExp,
    stripeCardCVC,
    couponCode
  } }, { user, models: { User } }) => {

    if (stripeCardNumber === INVALID_VALUE) throw new InvalidCreditCardNumberError();
    if (stripeCardExp === INVALID_VALUE) throw new InvalidCreditCardExpirationError();
    if (stripeCardCVC === INVALID_VALUE) throw new InvalidCreditCardCVCError();

    return User.updateBilling(user, {
      stripeCardName,
      stripeCardNumber,
      stripeCardExp,
      stripeCardCVC,
      couponCode
    });
  }
);

const userAddCoupon = isAuthenticatedResolver.createResolver(
  (root, { input: {
    couponCode
  } }, { user, models: { User } }) => {
    return User.addCoupon(user, {
      couponCode
    });
  }
);

const userChangePassword = baseResolver.createResolver(
  async (root, { input: {
    password,
    token
  } }, { user, models: { User } }) => {

    if (password === INVALID_VALUE) throw new InvalidPasswordError();

    if (!user && token) user = await User.findByForgotPasswordToken(token);

    if (!user) throw new UserNotFoundError();

    return User.changePassword(user, password, token);
  }
);

const userForgotPassword = isNotAuthenticatedResolver.createResolver(
  (root, { input: {
    email
  } }, { models: { User } }) => User.forgotPassword(email)
);

const userLoggedChangePassword = isAuthenticatedResolver.createResolver(
  (root, { input: {
    oldPassword,
    newPassword
  }}, { user, models: { User } }) => {
    if (newPassword === INVALID_VALUE) throw new InvalidPasswordError();
    return User.loggedChangePassword(user, oldPassword, newPassword);
  }
);

const userUpdateMyProfile = isAuthenticatedResolver.createResolver(
  (root, { input }, { user, models: { User } }) => {

    if (input.email === INVALID_VALUE) throw new InvalidEmailError();
    if (input.phoneNumber === INVALID_VALUE) throw new InvalidPhoneNumberError();
    if (input.linkedInProfileUrl === INVALID_VALUE) throw new InvalidUrlError();

    return User.updateProfile(user, input);
  }
);

const userUpdateMySettings = isAuthenticatedResolver.createResolver(
  (root, { input: {
    emailSubscribed,
    smsSubscribed
  }}, { user, models: { User } }) => User.updateSettings(user, {
    emailSubscribed,
    smsSubscribed
  })
);

const userEnableSMS = isAuthenticatedResolver.createResolver(
  (root, { input }, { user, models: { User } }) => {
    if (input.phoneNumber === INVALID_VALUE) throw new InvalidPhoneNumberError();
    return User.enableSMS(user, input);
  }
);

const userSeenSMSModal = isAuthenticatedResolver.createResolver(
  (root, { input }, { user, models: { User } }) => User.markHasSeenSMSModal(user, input)
);

const userBookedOrSkippedOnboardingCall = isAuthenticatedResolver.createResolver(
  (root, input, { user, models: { User } }) => User.markBookedOrSkippedOnboardingCall(user)
);

const userMarkMessagesRead = isAdminResolver.createResolver(
  (root, { input: {
    id
  }}, { models: { User } }) => User.markMessagesRead({
    id
  })
);

const userSeenMessages = isAuthenticatedResolver.createResolver(
  (root, args, { user, models: { User } }) => User.markHasSeenMessages(user)
);

const userSpoof = isAdminResolver.createResolver(
  (root, { input }, { models: { User } }) => User.spoof(input)
);

const userExchangeRedirectToken = baseResolver.createResolver(
  async (root, { input: { redirectToken } }, context) => {
    const { models: { User } } = context;

    const user = await User.exchangeRedirectToken(redirectToken);

    context.user = user;

    return user;
  }
);

// Edges /////////////////////

const Transactions = isAuthenticatedResolver.createResolver(
  (root, args, { user, models: { User } }) => user && (user.id === root.id || user.isAdmin) ? User.getTransactions(root) : []
);

const Avatar = baseResolver.createResolver(
  (root, args, { models: { User } }) => User.getAvatar(root)
);

const CurrentLocation = isAuthenticatedResolver.createResolver(
  (root, args, { models: { User } }) => User.getCurrentLocation(root)
);

// Subscriptions /////////////////

const userSubscription = isAuthenticatedResolver.createResolver(
  user => user
);


// Definition Object

export default {
  User: {
    Transactions,
    Avatar,
    CurrentLocation
  },
  Mutation: {
    userSignup,
    userCompleteSignup,
    userLogin,
    userUpdatePlan,
    userCancelPlan,
    userAddCoupon,
    userUpdateBilling,
    userChangePassword,
    userLoggedChangePassword,
    userForgotPassword,
    userUpdateMyProfile,
    userUpdateMySettings,
    userEnableSMS,
    userSpoof,
    userExchangeRedirectToken
  },
  Query: {
    getMyUser,
    searchUsers
  },
  Subscription: {
    userSubscription
  }
}
