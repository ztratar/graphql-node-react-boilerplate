import { baseResolver } from './_base';

const getTopicBySlug = baseResolver.createResolver(
  (root, { input: { slug } }, { models: { Topic } }) => Topic.findBySlug(slug)
)
.requireArgs({
  'input.slug': 'We were unable to find the requested topic'
});

const suggestTopics = baseResolver.createResolver(
  async (root, {
    input: { text }
  }, {
    models: { Topic }
  }) => Topic.suggest(text)
);

const getTopicsWithPosts = baseResolver.createResolver(
  async (root, {
    input: { offset = 0 }
  }, {
    models: { Topic }
  }) => Topic.findTopicsWithPosts(offset)
);

export default {
  Query: {
    getTopicBySlug,
    suggestTopics,
    getTopicsWithPosts
  }
};
