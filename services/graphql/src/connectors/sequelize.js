import Promise from 'bluebird';
import { inject } from 'injectorator';
import { DataTypes } from 'sequelize';

import BaseConnector from './base';
import sequelizePostgres from '../io/postgres';

let schemas = {};

// NOTE: We are naming raw SequelizeJS models "schemas" rather than "models" for clarity
const createSchema = (name, attributes = {}, options = {}) => {
  if (!schemas[name]) {
    schemas[name] = sequelizePostgres.define(name, {
      ...attributes,
      destroyedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      },
      destroyed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    }, options);
  }

  return {
    schema: schemas[name]
  };
};

const getSchema = name => schemas[name] || null;

export default class SequelizeConnector extends BaseConnector {
  constructor (
    schema
  ) {
    super();

    this.schema = schema;
  }
}

export {
  createSchema,
  DataTypes
};
