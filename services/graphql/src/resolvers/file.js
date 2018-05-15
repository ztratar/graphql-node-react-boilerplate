import {
  isAdminResolver
} from './_base';

const createPhoto = isAdminResolver.createResolver(
  (root, { input }, { user, models: { File } }) => File.create(input)
);

export default {
  Query: {
  },
  Mutation: {
    createPhoto
  }
};

