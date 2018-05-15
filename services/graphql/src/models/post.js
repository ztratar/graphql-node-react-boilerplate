import { inject } from 'injectorator';
import Promise from 'bluebird';
import debug from 'debug';
import _ from 'underscore';
import { slugifyModel } from 'sequelize-slugify';
import Sequelize from 'sequelize';
import uuid from 'uuid';

import transaction from '../decorators/transaction';
import ensure from '../functions/ensure';
import instantiate from '../functions/instantiate';
import instantiateMany from '../functions/instantiateMany';
import ensureMany from '../functions/ensureMany';
import throws from '../decorators/throws';
import sequelize from '../io/postgres';
import ElasticSearchConnector from '../connectors/elasticsearch';
import SequelizeConnector, { createSchema as createSequelizeSchema, DataTypes } from '../connectors/sequelize';
import BaseModel from './base';
import {
  CreatorRequiredError,
  CreatorNotFoundError,
  PostNotFoundError,
  TopicNotFoundError
} from '../errors/internal';

const log = debug('graphql:models:post');

const { schema: PostSchema } = createSequelizeSchema('Post', {
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
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  summary: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'public'
  },
  estimatedReadTime: {
    type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['content']),
    get: function () {
      const content = this.get('content') || '';
      return Math.floor((content && content.length || 1) / (300 * 5)) || 1;
    }
  }
});

slugifyModel(PostSchema, {
  source: ['title'],
  overwrite: false
});

export {
  PostSchema
};

@inject({
  PostSchema: () => PostSchema,
  SequelizeConnector: () => SequelizeConnector,
  sequelize: () => sequelize,
  ElasticSearchConnector: () => ElasticSearchConnector,
  Promise: () => Promise,
  ensure: () => ensure,
  instantiate: () => instantiate,
  instantiateMany: () => instantiateMany,
  ensureMany: () => ensureMany
})
@throws({
  CreatorNotFoundError,
  CreatorRequiredError,
  PostNotFoundError,
  TopicNotFoundError
})
export default class PostModel extends BaseModel {
  constructor ({
    PostSchema,
    SequelizeConnector,
    sequelize,
    ElasticSearchConnector,
    Promise,
    ensure,
    instantiate,
    instantiateMany,
    ensureMany
  }, reqUser) {
    super(reqUser);

    this._sequelizeConnector = new SequelizeConnector(PostSchema, 'id');
    this._sequelize = sequelize;
    this._Promise = Promise;
    this._ensure = ensure;
    this._instantiate = instantiate;
    this._instantiateMany = instantiateMany;
    this._ensureMany = ensureMany;

    this._elasticSearchConnector = new ElasticSearchConnector('posts', {
      id: {
        type: 'string',
        index: 'not_analyzed'
      },
      title: {
        type: 'string',
        analyzer: 'english',
        fields: {
          std: {
            type: 'string',
            analyzer: 'standard'
          }
        }
      },
      summary: {
        type: 'string',
        analyzer: 'english',
        fields: {
          std: {
            type: 'string',
            analyzer: 'standard'
          }
        }
      },
      content: {
        type: 'string',
        analyzer: 'english',
        fields: {
          std: {
            type: 'string',
            analyzer: 'standard'
          }
        }
      }
    });
  }

  get schema () {
    return this._sequelizeConnector.schema;
  }

  _createElasticSearchDocument (p) {
    return {
      id: p.id,
      title: p.title,
      summary: p.summary,
      content: p.content
    };
  }

  @transaction
  async create (data = {}, transactionContext) {
    const { transaction } = transactionContext;

    if (!data.Creator || !data.Creator.id) throw new PostModel.errors.CreatorRequiredError();

    if (!data.summary && data.content) data.summary = data.content.slice(0, 140) + '...';

    const instantiateUser = this._instantiate(this._peerModels.User, {
      create: false
    });
    const instantiateTopics = this._instantiateMany(this._peerModels.Topic);

    const ensureCreator = this._ensure(PostModel.CreatorNotFoundError, {
      data: {
        id: data.Creator.id
      }
    });
    const ensureTopics = this._ensureMany(PostModel.errors.TopicNotFoundError);

    const creator = await ensureCreator(instantiateUser(data.Creator, transaction));
    const image = data.Image ? await this._peerModels.File.create({
      ...data.Image,
      key: data.Image.key || `post-image-${uuid.v4()}`
    }, transaction) : null;

    const post = await this._sequelizeConnector.schema.create({
      ...data,
      Creator: undefined,
      Image: undefined,
      Topics: undefined
    }, {
      transaction
    });
    const topics = await ensureTopics(instantiateTopics(data.Topics || []), transaction);

    let ops = [];

    ops.push(post.setCreator(creator, {
      transaction
    }));
    if (image) ops.push(post.setImage(image, {
      transaction
    }));
    ops.push(post.setTopics(topics, {
      transaction
    }));

    await this._Promise.all(ops);

    transactionContext.after().then(async () => {
      this._elasticSearchConnector.index(post.id, await this._createElasticSearchDocument(post));
    });

    return post;
  }

  @transaction
  async update (data = {}, transactionContext) {
    const { transaction } = transactionContext;

    const post = await this.findById(data.id);

    if (!data.summary && data.content) data.summary = data.content.slice(0, 140) + '...';

    if (!post) throw new PostModel.errors.PostNotFoundError();

    const instantiateUser = this._instantiate(this._peerModels.User, {
      create: false
    });
    const instantiateFile = this._instantiate(this._peerModels.File);
    const instantiateTopics = this._instantiateMany(this._peerModels.Topic);

    if (data && data.Creator) {
      var ensureCreator = this._ensure(PostModel.CreatorNotFoundError, {
        data: {
          id: data.Creator.id
        }
      });
    }

    const ensureTopics = this._ensureMany(PostModel.errors.TopicNotFoundError);

    await post.update({
      ...data,
      id: undefined,
      Image: undefined,
      Creator: undefined,
      Topics: undefined
    }, {
      transaction
    });

    let ops = [];

    if (data.Creator) ops.push(ensureCreator(instantiateUser(data.Creator, transaction)).then(u => post.setCreator(u, {
      transaction
    })));

    const image = data.Image && data.Image.content ? await this._peerModels.File.create({
      ...data.Image,
      key: data.Image.key || `post-image-${uuid.v4()}`
    }, transaction) : null;

    if (image) ops.push(post.setImage(image, {
      transaction
    }));

    const topics = await ensureTopics(instantiateTopics(data.Topics || []), transaction);
    ops.push(post.setTopics(topics, {
      transaction
    }));

    await this._Promise.all(ops);

    transactionContext.after().then(async () => {
      this._elasticSearchConnector.index(post.id, await this._createElasticSearchDocument(post));
    });

    return post;
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

    const posts = await this._sequelizeConnector.schema.findAll({
      where: {
        destroyed: false
      },
      offset,
      limit,
      transaction
    });

    await Promise.all(posts.map(
      async p => this._elasticSearchConnector.index(p.id, await this._createElasticSearchDocument(p))
    ));

    return posts.length === limit ? posts.concat(await this.indexAll(transaction, offset + limit)) : posts;
  }

  @transaction
  async search ({ queryString = '', offset = 0 }, transactionContext) {
    const searchResults = await this._elasticSearchConnector.search({
      multi_match: {
        query: queryString,
        fields: [
          'title^8',
          'title.std^8',
          'summary^4',
          'summary.std^4',
          'content',
          'content.std'
        ]
      }
    }, {
      from: offset,
      size: 10
    });

    const dbObjs = await this._sequelizeConnector.schema.findAll({
      where: {
        id: { $in: _.pluck(searchResults, 'id') }
      }
    });

    return (searchResults || []).map(s => _.findWhere(dbObjs || [], { id: s.id }));
  }

  findById (id, transaction) {
    return this._sequelizeConnector.schema.findById(id, {
      transaction
    });
  }

  findOneBySlug (slug, transaction) {
    return this._sequelizeConnector.schema.findOne({
      where: {
        slug
      },
      transaction
    });
  }

  findAll ({ offset = 0, limit = 18, topicSlug = '', user }, transaction) {
    if (topicSlug) return this.findAllWithTopicSlug({ offset, slug: topicSlug, user }, transaction);

    return this.schema.findAll({
      where: {
        destroyed: false,
        status: user ? { $in: ['public', 'loggedin', 'paid'] } : 'public'
      },
      order: [
        ['createdAt', 'DESC']
      ],
      offset,
      limit,
      transaction
    });
  }

  findAllWithTopicSlug ({ offset = 0, slug }, transaction) {
    return this.schema.findAll({
      where: {
        destroyed: false
      },
      include: [{
        model: this._peerModels.Topic.schema,
        as: 'Topics',
        required: true,
        where: {
          slug
        }
      }],
      order: [
        ['createdAt', 'DESC']
      ],
      offset,
      limit: 20,
      transaction
    });
  }

  getCreator (post, transaction) {
    return post.getCreator({
      transaction
    });
  }

  getImage (post, transaction) {
    return post.getImage({
      transaction
    });
  }

  getTopics (post, transaction) {
    return post.getTopics({
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
