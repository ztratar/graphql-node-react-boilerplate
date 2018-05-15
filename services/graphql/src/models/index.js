import Promise from 'bluebird';

import sequelize from '../io/postgres';

import EmailModel, { EmailSchema } from './email';
import FileModel, { FileSchema } from './file';
import LocationModel, { LocationSchema } from './location';
import PostModel, { PostSchema } from './post';
import TopicModel, { TopicSchema } from './topic';
import UserModel, { UserSchema } from './user';

// Email relations
EmailSchema.belongsToMany(UserSchema, { as: 'Recipients', through: 'UserEmails' });

// Post relations
PostSchema.belongsTo(FileSchema, { as: 'Image' });
PostSchema.belongsTo(UserSchema, { as: 'Creator' });
PostSchema.belongsToMany(TopicSchema, { as: 'Topics', through: 'PostTopics' });

// Topic relations
TopicSchema.belongsToMany(PostSchema, { as: 'Posts', through: 'PostTopics' });

// User relations
UserSchema.hasMany(EmailSchema, { as: 'Emails' });
UserSchema.belongsTo(FileSchema, { as: 'Avatar', foreignKey: 'AvatarId' });
UserSchema.belongsTo(LocationSchema, { as: 'CurrentLocation', foreignKey: 'CurrentLocationId' });

// Sync all models
const synced = sequelize.sync();

const ModelConstructors = {
  EmailModel,
  FileModel,
  LocationModel,
  PostModel,
  TopicModel,
  UserModel
};

const conformModelName = (modelName) => (modelName.charAt(0).toUpperCase() + modelName.slice(1)).replace(/^Model$/, '');

if (__DEV__) {
  if (module.hot) {
    Object.keys(ModelConstructors).map(modelName => {
      module.hot.accept(`./${conformModelName(modelName)}`, () => {
        ModelConstructors[modelName] = require(`./${conformModelName(modelName)}`).default;
      });
    })
  }
}

// Model getter waits for sync completion
const getModels = async (reqUser = {}) => {
  await synced; //make sure we are synced

  const models = Object.keys(ModelConstructors).reduce((hash, key) => ({
    ...hash,
    [key.replace('Model', '')]: new ModelConstructors[key](reqUser)
  }), {});

  Object.keys(models).map((key) => {
    const otherModels = Object.keys(models)
      .filter((k) => k !== key)
      .reduce((hash, key) => ({
        ...hash,
        [key]: models[key]
      }), {});

    models[key].injectPeerModels(otherModels);
  });

  return models;
};

export default getModels;
