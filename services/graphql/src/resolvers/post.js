import {
  baseResolver,
  isAdminResolver
} from './_base';

const getPostBySlug = baseResolver.createResolver(
  (root, { query: { slug } }, { models: { Post } }) => Post.findOneBySlug(slug)
)
.requireArgs({
  'query.slug': 'We were unable to find the requested post'
});

const getPosts = baseResolver.createResolver(
  (root, { query: {
    offset = 0,
    topicSlug = '',
    limit = 18
  } }, { user, models: { Post } }) => Post.findAll({ offset, limit, topicSlug, user })
);

const getTopPosts = baseResolver.createResolver(
  (root, args, { models: { Post } }) => Post.findAll({ limit: 3 })
);

const searchPosts = baseResolver.createResolver(
  (root, { input: { offset, search } }, { models: { Post } }) => Post.search({
    queryString: search,
    offset
  })
);

const createPost = isAdminResolver.createResolver(
  (root, { input }, { user, models: { Post } }) => Post.create({
    ...input,
    Creator: input.Creator && input.Creator.id ? input.Creator : user,
  })
);

const updatePost = isAdminResolver.createResolver(
  (root, { input }, { user, models: { Post } }) => Post.update(input)
);

export default {
  Query: {
    getPostBySlug,
    getPosts,
    getTopPosts,
    searchPosts
  },
  Mutation: {
    createPost,
    updatePost
  },
  Post: {
    Image: (post, args, { models: { Post } }) => Post.getImage(post),
    Creator: (post, args, { models: { Post } }) => Post.getCreator(post),
    Topics: (post, args, { models: { Post } }) => Post.getTopics(post)
  }
};
