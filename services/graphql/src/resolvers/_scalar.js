import { Kind, GraphQLScalarType } from 'graphql';
import payment from 'payment';
import { isExponentPushToken } from 'exponent-server-sdk';
import GraphQLJSON from 'graphql-type-json';

import { captureException } from '../io/raven';

import { INVALID_VALUE } from '../constants';

import {
  isValidDate,
  isValidEmail,
  isValidPassword,
  isValidURL,
  isCreditCardNumber,
  isCreditCardExpirationDate,
  isCreditCardCVC,
  isValidPhoneNumber
} from '../functions/validators';

import {
  toDateObject,
  toDateString,
  toNormalizedEmail,
  toNormalizedHttpUrl,
  toE164Number
} from '../functions/sanitizers';

import {
  AWS_USER_FILE_CLOUDFRONT_FQDN
} from '../../config/environment';

const Date = new GraphQLScalarType({
  name: 'Date',
  description: 'An ISO8601-compliant Date',
  serialize (value) {
    return toDateString(value);
  },
  parseValue (value) {
    if (isValidDate(value)) {
      return toDateObject(value);
    }
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isValidDate(ast.value)) {
      return toDateObject(ast.value);
    }
    return INVALID_VALUE;
  }
});

const Email = new GraphQLScalarType({
  name: 'Email',
  description: 'A valid email address',
  serialize (value) {
    return value;
  },
  parseValue (value) {
    if (isValidEmail(value)) {
      return toNormalizedEmail(value);
    }
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isValidEmail(ast.value)) {
      return toNormalizedEmail(ast.value);
    }
    return INVALID_VALUE;
  }
});

const Password = new GraphQLScalarType({
  name: 'Password',
  description: 'A valid password',
  serialize (value) {
    return value;
  },
  parseValue (value) {
    if (isValidPassword(value)) {
      return value;
    }
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isValidPassword(ast.value)) {
      return ast.value;
    }
    return INVALID_VALUE;
  }
});

const Url = new GraphQLScalarType({
  name: 'URL',
  description: 'A valid URL string (http/https)',
  serialize (value) {
    return toNormalizedHttpUrl('https')(value);
  },
  parseValue (value) {
    if (isValidURL(value)) {
      return value;
    }
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isValidURL(ast.value)) {
      return ast.value;
    }
    return INVALID_VALUE;
  }
});

const CDNKey = new GraphQLScalarType({
  name: 'CDNKey',
  description: 'A url to a CDN asset',
  serialize (value) {
    return `${AWS_USER_FILE_CLOUDFRONT_FQDN}/${value}`;
  },
  parseValue (value) {
    return value.replace(AWS_USER_FILE_CLOUDFRONT_FQDN, '');
  },
  parseLiteral (ast) {
    return ast.value.replace(AWS_USER_FILE_CLOUDFRONT_FQDN, '');
  }
});

const CreditCardNumber = new GraphQLScalarType({
  name: 'CreditCardNumber',
  description: 'A credit card number',
  serialize (value) {
    return value;
  },
  parseValue (value) {
    if (isCreditCardNumber(value)) {
      return value;
    }
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isCreditCardNumber(ast.value)) {
      return ast.value;
    }
    return INVALID_VALUE;
  }
});


const CreditCardExpirationDate = new GraphQLScalarType({
  name: 'CreditCardExpirationDate',
  description: 'A credit card expiration date',
  serialize (value) {
    return value;
  },
  parseValue (value) {
    if (isCreditCardExpirationDate(value)) {
      value = value.replace(/\s/g, '')
      const [ month, year ] = value.split('/');
      return {
        month,
        year
      };
    }

    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    let value = ast.value;
    if (isCreditCardExpirationDate(value)) {
      value = value.replace(/\s/g, '')
      const [ month, year ] = value.split('/');
      return {
        month,
        year
      };
    }
    return INVALID_VALUE;
  }
});

const CreditCardCVC = new GraphQLScalarType({
  name: 'CreditCardCVC',
  description: 'A credit card CVC',
  serialize (value) {
    return value;
  },
  parseValue (value) {
    if (isCreditCardCVC(value)) {
      return value;
    }
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isCreditCardCVC(ast.value)) {
      return ast.value;
    }
    return INVALID_VALUE;
  }
});

const PhoneNumber = new GraphQLScalarType({
  name: 'PhoneNumber',
  description: 'A valid E.164-compliant phone number',
  serialize (value) {
    return value;
  },
  parseValue (value) {
    if (isValidPhoneNumber(value)) {
      return toE164Number(value);
    }
    captureException(new Error(`invalid phone number received from client: ${value}`));
    return INVALID_VALUE;
  },
  parseLiteral (ast) {
    if (isValidPhoneNumber(ast.value)) {
      return toE164Number(ast.value);
    }
    captureException(new Error(`invalid phone number received from client: ${ast.value}`));
    return INVALID_VALUE;
  }
});

export default {
  Date,
  Email,
  Password,
  Url,
  CDNKey,
  CreditCardNumber,
  CreditCardExpirationDate,
  CreditCardCVC,
  PhoneNumber,
  JSON: GraphQLJSON
};
