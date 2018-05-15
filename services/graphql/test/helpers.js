import Promise from 'bluebird';
import timekeeper from 'timekeeper';
import moment from 'moment';

import {
  REDIRECT_JWT_SECRET
} from '../config/environment';

import {
  objectToToken,
  tokenToObject
} from '../src/lib/crypto';

export const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDateByTimeOffset = (hours = 0, minutes = 0, seconds = 0, dayOfWeek = 0) => moment(`2017-01-0${Math.min(dayOfWeek, 6) + 1}`)
  .tz('America/Los_Angeles')
  .add(hours, 'hours')
  .add(minutes, 'minutes')
  .add(seconds, 'seconds')
  .toDate();
  
export const setTime = (hours, minutes, seconds, dayOfWeek) => timekeeper.freeze(getDateByTimeOffset(hours, minutes, seconds, dayOfWeek));

export const resetTime = () => timekeeper.reset();

export const createValidRedirectToken = (data = {}) => objectToToken(data, REDIRECT_JWT_SECRET);

export const createInvalidRedirectToken = (data = {}) => objectToToken(data, 't13hg9pqjgopqj');

export const validateAuthToken = token => tokenToObject(token); 
