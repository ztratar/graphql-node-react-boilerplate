import Promise from 'bluebird';
import debug from 'debug';

import { NODE_ENV } from '../../config/environment';

import elasticsearch from '../io/elasticsearch';
import BaseConnector from './base';

const log = debug('graphql:connectors:elasticsearch');

const readyStates = new Map(); //stores async state of type existence

const getIndexString = typeName => `${typeName}_${NODE_ENV.toLowerCase()}`;

const typeExists = typeName => new Promise((resolve, reject) => elasticsearch.indices.exists({
  index: getIndexString(typeName)
}, (err, exists) => err ? reject(err) : resolve(exists)));

const typeCreate = (typeName, properties) => new Promise((resolve, reject) => {
  log('trying to create', typeName);
  return elasticsearch.indices.create({
    index: getIndexString(typeName),
    body: {
      mappings: {
        [typeName]: {
          properties
        }
      }
    }
  }, (err, res) => err ? reject(err) : resolve(res))
});

const typeDelete = (typeName) => new Promise((resolve, reject) => elasticsearch.indices.delete({
  index: getIndexString(typeName)
}, (err, res) => err ? reject(err) : resolve(res)));

const typeUpdate = (typeName, properties) => new Promise((resolve, reject) => {
  log('trying to update', typeName);
  return elasticsearch.indices.putMapping({
    index: getIndexString(typeName),
    type: typeName,
    body: {
      properties
    }
  }, (err, res) => {
    return err ? reject(err) : resolve(res)
  })
});

const typeEnsure = async (typeName, properties) => {
  log('ensuring', typeName);
  if (!(await typeExists(typeName))) {
    try {
      return await typeCreate(typeName, properties);
    } catch (e) {
      console.log('create err', e);
      return;
    }
  }
  return await typeUpdate(typeName, properties);
};

const typeReset = async (typeName, properties) => {
  if (await typeExists(typeName)) {
    await typeDelete(typeName);
  }

  const create = await typeCreate(typeName, properties);

  return create;
};

const indexDocument = (typeName, id, body) => new Promise((resolve, reject) => elasticsearch.index({
  index: getIndexString(typeName),
  type: typeName,
  id,
  body
}, (err, res) => err ? reject(err) : resolve(res)));

const removeDocument = (typeName, id) => new Promise((resolve, reject) => elasticsearch.delete({
  index: getIndexString(typeName),
  type: typeName,
  id
}, (err, res) => err ? reject(err) : resolve(res)));

const search = (typeName, opts = {}) => new Promise((resolve, reject) => elasticsearch.search({
  body: {
    ...opts,
  },
  index: getIndexString(typeName),
  type: typeName
}, (err, res) => err ? reject(err) : resolve(res)));

const suggest = (typeName, body = {}) => new Promise((resolve, reject) => elasticsearch.suggest({
  index: getIndexString(typeName),
  body
}, (err, res) => err ? reject(err) : resolve(res)));

export default class ElasticSearchConnector extends BaseConnector {
  constructor (typeName, properties) {
    super();

    this._typeName = typeName;
    this._properties = properties;

    this._readyState = readyStates.get(typeName) || this._resetReadyState();
  }

  _resetReadyState () {
    this._readyState = readyStates.set(this._typeName, (
      typeEnsure(this._typeName, this._properties)
    )).get(this._typeName);

    return this._readyState;
  }

  _hardResetReadyState () {

    this._readyState = readyStates.set(this._typeName, (
      typeReset(this._typeName, this._properties)
    )).get(this._typeName);

    return this._readyState;
  }

  async index (id, data) {
    await this._readyState;
    log(`indexing document of type ${this._typeName} and id ${id}`);
    return await indexDocument(this._typeName, id, data);
  }

  async remove (id) {
    await this._readyState;
    log(`removing document of type ${this._typeName} and id ${id}`);
    return await removeDocument(this._typeName, id);
  }

  async suggest (field, { text, size, context }) {
    await this._readyState;

    log(`suggesting from type ${this._typeName} with field ${field} and text "${text}"`);

    const data = await suggest(this._typeName, {
      response: {
        text,
        completion: {
          field,
          size,
          context
        }
      }
    });

    const response = data.response;

    log(`found ${response[0].options.length} suggestions from type ${this._typeName} with field ${field} and text "${text}"`);

    return response[0].options.map(({ payload }) => payload);
  }

  async search (query = {}, opts = {}) {
    await this._readyState;

    log(`searching from type ${this._typeName} with query %O`, query);

    const { hits } = await search(this._typeName, {
      query,
      ...opts
    });

    log(`found ${hits.hits.length} matches for search from type ${this._typeName} with query %O`, query);

    return hits.hits.map(({ _source }) => _source);
  }

  async reset () {
    log(`resetting index from type ${this._typeName}`);

    log(`type deleted from type ${this._typeName}`);

    await this._hardResetReadyState();

    log(`reset index from type ${this._typeName}`);

    return null;
  }
}
