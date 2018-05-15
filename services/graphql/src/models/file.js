import { inject } from 'injectorator';
import Promise from 'bluebird';
import Sequelize from 'sequelize';
import debug from 'debug';
import mime from 'mime';
import uuid from 'uuid';

import SequelizeConnector, { createSchema as createSequelizeSchema, DataTypes } from '../connectors/sequelize';
import AWSS3Connector from '../connectors/aws/s3';
import xhr from '../io/xhr';
import BaseModel from './base';
import { isHTTPUrl } from '../functions/types';

const log = debug('graphql:models:file');

const { schema: FileSchema } = createSequelizeSchema('File', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  key: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      notEmpty: true
    }
  }
});

export {
  FileSchema
};

@inject({
  FileSchema: () => FileSchema,
  SequelizeConnector: () => SequelizeConnector,
  AWSS3Connector: () => AWSS3Connector,
  xhr: () => xhr,
  isHTTPUrl: () => isHTTPUrl,
  mime: () => mime
})
export default class FileModel extends BaseModel {
  constructor ({
    FileSchema,
    SequelizeConnector,
    AWSS3Connector,
    xhr,
    isHTTPUrl,
    mime
  }, reqUser) {
    super(reqUser);

    this._schema = FileSchema;
    this._sequelizeConnector = new SequelizeConnector(FileSchema, 'id');
    this._awsS3Connector = new AWSS3Connector();
    this._xhr = xhr;
    this._isHTTPUrl = isHTTPUrl;
    this._mime = mime;
  }

  get schema () {
    return this._schema;
  }

  async _createFromUrl ({ url, key }, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;

    try {
      const res = await this._xhr.get(url, {
        responseType: 'arraybuffer'
      });

      const { data: file, headers } = res;

      const ext = mime.extension(headers['content-type']);

      log(`creating file from URL with key ${key} and extension ${ext}`);

      return await this.create({
        file,
        key,
        ext
      }, transactionContext);
    } catch (e) {
      throw new Error('failed to fetch file from URL');
    }
  }

  async create ({ file, content, key, ext }, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;

    if (!key) key = 'rawfile-' + uuid.v4() + '-' + Date.now();

    if (content || file) {
      if (typeof file === 'string' && file && this._isHTTPUrl(file)) return await this._createFromUrl({
        url: file,
        key
      }, transactionContext);

      log(`moving file to s3 with key ${key}`);

      await this._awsS3Connector.putObject({
        file: content || (file[0] ? file[0].buffer || file : file.buffer ? file.buffer : file),
        key: key,
        ext
      });
    }

    log(`creating file instance with key ${key}`)

    return await this._sequelizeConnector.schema.create({
      key
    }, {
      transaction
    });
  }

  findById (id, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findById(id, {
      transaction
    });
  }

  isInstance (subject) {
    return subject instanceof this._sequelizeConnector.schema.Instance;
  }

  rebuild (inst) {
    return this._sequelizeConnector.schema.build(inst, { isNewRecord: !inst.id });
  }
}
