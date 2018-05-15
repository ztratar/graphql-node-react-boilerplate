import generic from './_generic.graphql';
import mutation from './_mutation.graphql';
import query from './_query.graphql';
import subscription from './_subscription.graphql';
import scalar from './_scalar.graphql';
import schema from './_schema.graphql';

import file from './file.graphql';
import location from './location.graphql';
import topic from './topic.graphql';
import user from './user.graphql';
import post from './post.graphql';

export default [
  // General
  generic,
  mutation,
  query,
  subscription,
  scalar,
  schema,

  // Type specific
  file,
  location,
  topic,
  user,
  post
];
