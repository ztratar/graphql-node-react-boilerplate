import { isAuthenticatedResolver } from './_base';

const searchLocations = isAuthenticatedResolver.createResolver(
  (root, { input: { text } }, { models: { Location } }) => Location.search(text)
);

export default {
  Query: {
    searchLocations
  }
};
