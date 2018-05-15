import {
  normalizeEmail,
  toDate,
  toFloat
} from 'validator';

import {
  format as formatNumber, parse as parseNumber
} from 'libphonenumber-js';

export const toDateObject = dateStr => toDate(dateStr);

export const toDateString = date => {
  if (date instanceof Date) {
    return date.toISOString()
  } else if (date) {
    return (new Date(date)).toISOString();
  } else {
    return null;
  }
};

export const toNormalizedEmail = email => normalizeEmail(toUnescapedString(email), {
  gmail_remove_subaddress: false,
  outlookdotcom_remove_subaddress: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false,
  gmail_remove_dots: false
});

export const oldToNormalizedEmail = email => normalizeEmail(toUnescapedString(email));

const httpPrefix = 'http://';
const httpsPrefix = 'https://';

export const toNormalizedHttpUrl = prefix => url => {
  url = url.toLowerCase();
  return toUnescapedString(url.indexOf('http://') === -1 && url.indexOf('https://') === -1 ? `${prefix}://${url}` : url)
};

export const toUnescapedString = str => str
  .replace('\'', '')
  .replace('\"', '')
  .replace('\n', '')
  .replace('\r', '')
  .replace('\t', '')
  .replace('\b','')
  .replace('\f', '')
  .replace('\v', '')
  .replace('\0', '');

export const noop = d => d;

export const toCurrencyFloat = str => toFloat(str
  .replace(/[^0-9\.]+/g, '')
);

export const toCurrencyString = num => '$' + num.toFixed(2);

export const toE164Number = num => formatNumber(parseNumber(num), 'International_plaintext');
