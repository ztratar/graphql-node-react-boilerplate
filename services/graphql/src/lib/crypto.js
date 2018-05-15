import bcrypt from 'bcrypt';
import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

import {
  JWT_SECRET
} from '../../config/environment';

export const makeSaltedHash = (input) => new Promise((resolve, reject) => (
  bcrypt.genSalt(10, (err, salt) => err ? reject(err) : resolve(salt))
)).then(salt => new Promise((resolve, reject) => (
  bcrypt.hash(input, salt, (err, hash) => err ? reject(err) : resolve(hash))
)));

export const compareSaltedHash = (input, hash) => new Promise((resolve, reject) => (
  bcrypt.compare(input, hash, (err, res) => err ? reject(err) : res ? resolve(true) : resolve(false))
));

export const objectToToken = (obj = {}, secret = JWT_SECRET) => new Promise((resolve, reject) => (
  jwt.sign(obj, secret, {}, (err, token) => err ? reject(err) : resolve(token))
));

export const tokenToObject = (token, secret = JWT_SECRET) => new Promise((resolve, reject) => (
  jwt.verify(token, secret, (err, obj) => err ? reject(err) : resolve(obj))
));
