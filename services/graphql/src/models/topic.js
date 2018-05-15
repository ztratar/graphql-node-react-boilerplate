import { inject } from 'injectorator';
import Promise from 'bluebird';
import { slugifyModel } from 'sequelize-slugify';
import debug from 'debug';

import ElasticSearchConnector from '../connectors/elasticsearch';
import SequelizeConnector, { createSchema as createSequelizeSchema, DataTypes } from '../connectors/sequelize';
import BaseModel from './base';

const log = debug('graphql:models:topic');

const { schema: TopicSchema } = createSequelizeSchema('Topic', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

slugifyModel(TopicSchema, {
  source: ['title'],
  overwrite: false
});

export {
  TopicSchema
};

@inject({
  TopicSchema: () => TopicSchema,
  ElasticSearchConnector: () => ElasticSearchConnector,
  SequelizeConnector: () => SequelizeConnector
})
export default class TopicModel extends BaseModel {
  constructor ({
    TopicSchema,
    ElasticSearchConnector,
    SequelizeConnector
  }, reqUser) {
    super(reqUser);

    this._schema = TopicSchema;

    this._elasticSearchConnector = new ElasticSearchConnector('topics', {
      id: {
        type: 'string',
        index: 'not_analyzed'
      },
      title: {
        type: 'string'
      },
      autocomplete: {
        type: 'completion',
        analyzer: 'simple',
        search_analyzer: 'simple',
        payloads: true
      }
    });

    this._sequelizeConnector = new SequelizeConnector(TopicSchema);
  }

  get schema () {
    return this._schema;
  }

  _createElasticSearchDocument (topic) {
    return {
      id: topic.id,
      title: topic.title,
      autocomplete: {
        input: [topic.title],
        payload: {
          ...topic.toJSON()
        }
      }
    };
  }

  async create ({ title }, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    log('creating or finding topic with title "%s"', title);
    const [ topic, created ] = await this._sequelizeConnector.schema.findOrCreate({
      where: {
        title: {
          $iLike: title
        }
      },
      defaults: {
        title
      },
      transaction
    });

    if (created) {
      log(`sending new topic "${topic.id}" with title "${topic.title}" to elastic search`);
      await this._elasticSearchConnector.index(topic.id, this._createElasticSearchDocument(topic));
    } else {
      log(`reusing existing topic "${topic.id}" with title "${topic.title}"`);
    }

    return topic;
  }

  async suggest (text, size = 5) {
    const topics = await this._elasticSearchConnector.suggest('autocomplete', {
      text,
      size
    });

    return topics.map(topic => this.rebuild(topic));
  }

  async indexAll (transaction, offset = 0) {
    if (offset === 0) {
      try {
        await this._elasticSearchConnector.reset(); //remove the existing index so that it will be recreated
      } catch (e) {
        log('error removing existing index while indexing all documents: %O', e);
      }
    }

    const limit = 2;

    const topics = await this._sequelizeConnector.schema.findAll({
      where: {
        destroyed: false
      },
      offset,
      limit,
      transaction
    });

    await Promise.all(topics.map(
      topic => this._elasticSearchConnector.index(topic.id, this._createElasticSearchDocument(topic))
    ));

    return topics.length === limit ? topics.concat(await this.indexAll(transaction, offset + limit)) : topics;
  }

  findTopicsWithPosts (offset = 0, transaction) {
    return this._sequelizeConnector.schema.findAll({
      where: {
        destroyed: false
      },
      include: [{
        model: this._peerModels.Post.schema,
        as: 'Posts',
        required: true
      }],
      transaction
    });
  }

  findAll (opts = {}, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findAll({
      ...opts,
      transaction
    });
  }

  findBySlug (slug, transaction) {
    return this._sequelizeConnector.schema.findOne({
      where: {
        slug
      },
      transaction
    });
  }

  findWhere (where = {}, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findAll({
      where,
      transaction
    });
  }

  findById (id, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findById(id, {
      transaction
    });
  }

  findByIds (ids = [], transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findAll({
      where: {
        id: {
          $in: ids.filter(id => !!id)
        }
      },
      limit: 999,
      transaction
    });
  }

  findByName (name, transactionContext) {
    const transaction = transactionContext ? transactionContext.transaction : null;
    return this._sequelizeConnector.schema.findOne({
      where: {
        name
      },
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
