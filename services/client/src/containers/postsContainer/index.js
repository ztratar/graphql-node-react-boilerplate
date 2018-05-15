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
  query getTopicsWithPosts ($input: TopicQueryInput!){
    topics: getTopicsWithPosts (input: $input) {
      id
      slug
      title
    }
  }
`, {
  options: ({
    params: {
      offset = 0
    }
  }) => ({
    variables: {
      input: {
        offset
      }
    }
  }),
  props: ({
    data: {
      loading,
      networkStatus,
      refetch,
      topics,
      error
    }
  }) => ({
    topics
  })
})
@graphql(gql`
  query getPosts ($query: PostFindInput!){
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
  }
`, {
  options: ({
    params: {
      offset = 0
    }
  }) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      query: {
        offset
      }
    }
  }),
  props: ({
    data: {
      loading,
      networkStatus,
      refetch,
      fetchMore,
      posts,
      error
    }
  }) => {
    return {
      loading,
      loadingMore: networkStatus === 1,
      posts,
      error,
      getMorePosts () {
        if (!posts || !posts.length) {
          return refetch();
        }

        return fetchMore({
          variables: {
            query: {
              offset: posts.length
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
export default class PostsContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);

    this.state = {
      allPostsLoaded: false
    };
  }

  componentDidMount () {
    this.props.actions.setMeta({
      title: 'Jobstart - Posts',
      description: 'A collection of guides & posts on Jobstart'
    });
  }

  componentWillUnmount () {
    this.props.actions.revertMeta();
  }

  @autobind
  _onInfiniteScrollTrigger (t) {
    if (this.props.loadingMore || this.state.allPostsLoaded) return;

    const initialPostsNum = (this.props.posts || []).length;

    analytics.track('POSTS_PAGINATE', {
      isLoggedIn: this.props.hasToken
    });

    this.props.getMorePosts().then(() => {
      this.setState({
        allPostsLoaded: initialPostsNum === (this.props.posts || []).length
      });
    }, e => e);
  }

  render () {
    return (
      <div className={classNames(style.postsContainer, !this.props.hasToken ? style.publicPostsContainer : '')}>
        { !this.props.hasToken ? (
          <div className={style.header}>
            <h1>Learn</h1>
            <p>
              Learn from industry experts, career coaches, and Boost!
            </p>
          </div>
        ) : null }
        <div className={classNames(style.postsOuterWrapper, !this.props.hasToken ? style.publicPostsOuterWrapper : '')}>
          <div className={style.rightCol}>
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
      </div>
    );
  }
}
