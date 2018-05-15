import { isBase64, isURL } from 'validator';

export const isValidPasswordString = value => typeof value === 'string' && value.length >= 6 && !(/\s/).test(value);

export const isHTTPUrl = value => isURL(value, {
  protocols: ['http', 'https']
});


export const isBase64File = val => (
  val &&
  typeof val === 'string' &&
  isBase64(val.replace(/^data:\w+\/\w+;base64,/, ''))
);
