import { inject } from 'injectorator';
import Promise from 'bluebird';
import AWS from 'aws-sdk';
import debug from 'debug';
import mime from 'mime';
import base64mime from 'base64mime';

import { isBase64File } from '../../functions/types';
import * as logger from '../../io/logger';
import BaseAWSConnector from './base';

import {
  AWS_USER_FILE_BUCKET,
  AWS_USER_FILE_ACCESS_KEY_ID,
  AWS_USER_FILE_SECRET_ACCESS_KEY,
  AWS_USER_FILE_REGION,
  AWS_USER_FILE_ACL
} from '../../../config/environment';

// TODO: Perhaps refactor this into a generic S3 connector and pass bucket/creds/etc into the constructor?

const log = debug('graphql:connectors:aws:s3');

@inject({
  AWS: () => AWS,
  AWS_USER_FILE_BUCKET,
  AWS_USER_FILE_ACCESS_KEY_ID,
  AWS_USER_FILE_SECRET_ACCESS_KEY,
  AWS_USER_FILE_REGION,
  AWS_USER_FILE_ACL,
  Promise: () => Promise,
  logger: () => logger,
  mime: () => mime,
  base64mime: () => base64mime,
  isBase64File: () => isBase64File
})
export default class AWSS3Connector extends BaseAWSConnector {
  constructor ({
    AWS,
    AWS_USER_FILE_BUCKET,
    AWS_USER_FILE_ACCESS_KEY_ID,
    AWS_USER_FILE_SECRET_ACCESS_KEY,
    AWS_USER_FILE_REGION,
    AWS_USER_FILE_ACL,
    Promise,
    logger,
    mime,
    base64mime,
    isBase64File
  }) {
    super();

    this._S3 = new AWS.S3({
      accessKeyId: AWS_USER_FILE_ACCESS_KEY_ID,
      secretAccessKey: AWS_USER_FILE_SECRET_ACCESS_KEY,
      region: AWS_USER_FILE_REGION,
      logger
    });

    this._logger = logger;

    this._AWS_USER_FILE_BUCKET = AWS_USER_FILE_BUCKET;

    this._AWS_USER_FILE_ACL = AWS_USER_FILE_ACL;

    this._Promise = Promise;

    this._mime = mime;

    this._base64mime = base64mime;

    this._isBase64File = isBase64File;
  }

  _getBaseParams () {
    return {
      Bucket: this._AWS_USER_FILE_BUCKET
    };
  }

  putObject ({ file, ext, key, meta = {} }) {
    let Body = null
      , ACL = this._AWS_USER_FILE_ACL
      , Key = key
      , ContentType = null
      , ContentEncoding = null
      , Metadata = meta;

    if (!file) throw new Error('file cannot be undefined');
    if (!key) throw new Error('key cannot be undefined');

    if (this._isBase64File(file)) {
      Body = new Buffer(file.replace(/^data:\w+\/\w+;base64,/, ''),'base64');
      ContentEncoding = 'base64';
      ContentType = this._base64mime(file) || undefined;
    } else {
      Body = file;
      ContentType = ext ? this._mime.lookup(ext) || undefined : undefined;
    }

    log(`uploading file of type ${ContentType} and key ${key}`);

    return new this._Promise((resolve, reject) => this._S3.putObject({
      ...this._getBaseParams(),
      Body,
      ACL,
      Key,
      ContentType,
      ContentEncoding,
      Metadata
    }, (err, data) => err ? reject(err) : resolve(data))).catch((e) => {
      this._logger.trace(e);
      throw e;
    });
  }
}
