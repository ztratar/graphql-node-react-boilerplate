import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

import {
  REDIRECT_JWT_SECRET
} from '../../config/environment';

export const redirectTokenToObject = (token) => new Promise((resolve, reject) => (
  jwt.verify(token, REDIRECT_JWT_SECRET, (err, obj) => err ? reject(err) : resolve(obj))
));
