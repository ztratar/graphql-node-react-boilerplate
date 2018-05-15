import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { autobind } from 'core-decorators';
import gql from 'graphql-tag';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import form from '../../decorators/form';
import PureComponent from '../../components/common/pure';
import ButtonLink from '../../components/buttonLink';
import Loader from '../../components/loader';
import PostCard from '../../components/_post/postCard';
import { set, revert } from '../../state/redux/actions/app/meta';
import InfiniteScrollView from 'components/infiniteScrollView';

import style from './index.css';

@connect(
  state => ({
    hasToken: !!state.app.getIn(['auth', 'token']),
  }),
  (dispatch, props) => ({
    actions: {
      setMeta: (meta) => dispatch(set(meta)),
      revertMeta: () => dispatch(revert())
    }
  })
)
@graphql(gql`
  query getPosts ($query: PostFindInput!, $input: TopicSlugQueryInput!){
    posts: getPosts (query: $query) {
      id
      slug
      title
      summary
      estimatedReadTime
      createdAt
      Image {
        id
        key
      }
      Creator {
        id
        name
        Avatar {
          id
          key
        }
      }
      Topics {
        id
        slug
        title
      }
    }
    topic: getTopicBySlug (input: $input) {
      id
      slug
      title
    }
  }
`, {
  options: ({
    params: {
      offset = 0,
      topicSlug: slug
    }
  }) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      query: {
        offset,
        topicSlug: slug
      },
      input: {
        slug
      }
    }
  }),
  props: ({
    ownProps: {
      actions: {
        setMeta
      }
    },
    data: {
      loading,
      networkStatus,
      refetch,
      fetchMore,
      posts,
      topic,
      error
    }
  }) => {
    if (topic) {
      const postsWithImage = (posts || []).filter(p => p.Image && p.Image.key);

      setMeta({
        title: `${topic.title} | Jobstart`,
        description: `Browse posts related to ${topic.title} on Jobstart`,
        image: postsWithImage.length && postsWithImage[0] && postsWithImage[0].Image && postsWithImage[0].Image.key
      });
    }

    return {
      loading,
      loadingMore: networkStatus === 1,
      posts,
      topic,
      error,
      getMorePosts () {
        if (!posts || !posts.length) {
          return refetch();
        }

        return fetchMore({
          variables: {
            query: {
              offset: posts.length,
              topicSlug: topic.slug
            }
          },
          updateQuery: (prevResult = {}, { fetchMoreResult: { posts } }) => ({
            ...prevResult,
            posts: _.uniq([
              ...(prevResult.posts || []),
              ...(posts || [])
            ], false, (e) => e.id)
          })
        });
      }
    }
  }
})
@withStyles(style)
export default class TopicPostsContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);

    this.state = {
      allPostsLoaded: false
    };
  }

  componentWillUnmount () {
    this.props.actions.revertMeta();
  }

  @autobind
  _onInfiniteScrollTrigger (t) {
    if (this.props.loadingMore || this.state.allPostsLoaded) return;

    const initialPostsNum = (this.props.posts || []).length;

    analytics.track('TOPIC_POSTS_PAGINATE', {
      isLoggedIn: this.props.hasToken
    });

    this.props.getMorePosts().then(() => {
      this.setState({
        allPostsLoaded: initialPostsNum === (this.props.posts || []).length
      });
    }, e => e);
  }

  render () {
    if (this.props.loading || !this.props.topic) {
      return (
        <Loader type='pageLoader'/>
      );
    }

    return (
      <div className={classNames(style.topicPostsContainer, !this.props.hasToken ? style.publicTopicPostsContainer : '')}>
        <div className={classNames(style.header, !this.props.hasToken ? style.publicHeader : '')}>
          <h1>{this.props.topic.title}</h1>
        </div>
        <div className={classNames(style.postsOuterWrapper, !this.props.hasToken ? style.publicPostsOuterWrapper : '')}>
          <InfiniteScrollView
            onTriggerBottom={this._onInfiniteScrollTrigger}
            isLoading={this.props.loading || this.props.loadingMore}
          >
            <div className={style.postsWrapper}>
              {(this.props.posts || []).map(p => <PostCard post={p} key={p.id}/>)}
            </div>
          </InfiniteScrollView>
        </div>
      </div>
    );
  }
}
