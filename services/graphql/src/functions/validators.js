import payment from 'payment';

import {
  isEmail,
  isISO8601,
  isURL,
  isCurrency,
  isMobilePhone
} from 'validator';

import {
  isValidNumber, parse as parseNumber
} from 'libphonenumber-js';

import {
  isHTTPUrl,
  isValidPasswordString
} from './types';

export const isValidEmail = value => isEmail(value);

export const isValidDate = value => isISO8601(value);

export const isValidURL = value => value && isHTTPUrl(value.toLowerCase());

export const isValidPassword = value => isValidPasswordString(value);

export const isCreditCardNumber = value => payment.fns.validateCardNumber(value);

export const isCreditCardExpirationDate = value => payment.fns.validateCardExpiry(value);

export const isCreditCardCVC = value => payment.fns.validateCardCVC(value);

export const isValidPhoneNumber = value => isValidNumber(parseNumber(value));
