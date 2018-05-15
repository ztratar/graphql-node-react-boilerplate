import merge from 'deepmerge';

export default (resolvers = []) => resolvers
  .reduce((combined, resolver) => merge(combined, resolver));
