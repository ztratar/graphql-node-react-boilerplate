import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { autobind, throttle } from 'core-decorators';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import form from 'decorators/form';
import graphqlDeferred from 'decorators/graphqlDeferred';

import PureComponent from '../../components/common/pure';
import AdminPostCard from '../../components/_post/adminPostCard';
import ButtonLink from '../../components/buttonLink';
import InfiniteScrollView from 'components/infiniteScrollView';
import CreateEditPostCard from 'components/_post/createEditPostCard';
import Icon from 'components/icon';
import { Input } from 'components/form';

import style from './index.css';

@form({
  id: 'admin-posts-container',
  initialState: {
    searchText: '',
    searchLoading: false,
    searchResults: []
  }
})
@graphql(gql`
  query getPosts ($query: PostFindInput!){
    posts: getPosts (query: $query) {
      __typename
      id
      slug
      title
      content
      summary
      status
      createdAt
      updatedAt
      Image {
        __typename
        id
        key
      }
      Creator {
        __typename
        id
        name
      }
      Topics {
        __typename
        id
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
    ssr: false,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
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
          updateQuery: (prevResult = {}, { fetchMoreResult: { data: { posts } } }) => ({
            ...prevResult,
            posts: _.sortBy(_.uniq([
              ...(prevResult.posts || []),
              ...(posts || [])
            ], false, (e) => e.id), p => -1 * Date.parse(p.updatedAt || p.createdAt))
          })
        });
      }
    }
  }
})
@graphqlDeferred('searchPosts', gql`
  query searchPosts ($input: SearchPostsInput!) {
    searchedPosts: searchPosts (input: $input) {
      __typename
      id
      slug
      title
      content
      summary
      status
      createdAt
      updatedAt
      Image {
        __typename
        id
        key
      }
      Creator {
        __typename
        id
        name
      }
      Topics {
        __typename
        id
        title
      }
    }
  }
`, {
  fetchPolicy: 'network-only'
})
@withStyles(style)
export default class AdminPostsContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);

    this.state = {
      allPostsLoaded: false,
      showPostCreation: false
    };
  }

  @autobind
  _onInfiniteScrollTrigger (t) {
    if (this.props.loadingMore || this.state.allPostsLoaded) return;

    const initialPostsNum = (this.props.posts || []).length;

    this.props.getMorePosts().then(() => {
      this.setState({
        allPostsLoaded: initialPostsNum === (this.props.posts || []).length
      });
    }, e => e);
  }

  @autobind
  _toggleShowPost () {
    this.setState({
      showPostCreation: !this.state.showPostCreation
    });
  }

  @autobind
  _onChangeSearchText (val) {
    this.props.setInForm(['searchText'], val);

    if (val === '') {
      this.props.setInForm(['searchResults'], []);
    }
  }

  @autobind
  _onClickClearSearchText (val) {
    this.props.setInForm(['searchText'], '');
    this.props.setInForm(['searchResults'], []);
  }

  @autobind
  async _onKeyDownSearch (e) {
    this.props.setInForm(['searchLoading'], true);
    await this._triggerPostSearch();
  }

  @autobind
  @throttle(2000)
  async _triggerPostSearch () {
    const resp = await this.props.searchPosts({
      input: {
        search: this.props.form.getIn(['searchText'])
      }
    });

    if (resp && resp.data && resp.data.searchedPosts) {
      this.props.setInForm(['searchResults'], resp.data.searchedPosts);
    }

    this.props.setInForm(['searchLoading'], false);
  }

  render () {
    const { post } = this.props;

    const searchText = this.props.form.get('searchText');
    const searchResults = this.props.form.get('searchResults');
    const searchResultsFormatted = searchResults ? searchResults.toJSON() : [];
    const searchLoading = this.props.form.get('searchLoading');

    return (
      <div className={style.adminPostsContainerl}>
        <div className={style.adminPostsWrapper}>
          <div className={style.searchInputWrap}>
            <Icon src={61788}/>
            <Input
              ref='searchInputWrap'
              placeholder='Search posts...'
              className={style.searchInput}
              value={searchText}
              onChange={this._onChangeSearchText}
              background='greyLightest'
              onKeyDown={this._onKeyDownSearch}
            />
            { searchText ? <a className={style.clearSearchButton} onClick={this._onClickClearSearchText}>
              <i className='icon'>{String.fromCharCode(61943)}</i>
            </a> : null}
          </div>
          { this.state.showPostCreation ? (
            <div className={style.createWrapper}>
              <CreateEditPostCard
                onCancel={this._toggleShowPost}
                onCreate={this._toggleShowPost}
              />
            </div>
          ) : (
            <ButtonLink
              text='Create a new post'
              size='sm'
              uppercase={true}
              className={style.createNewButton}
              onClick={this._toggleShowPost}
            />
          ) }
          <InfiniteScrollView
            onTrigger={searchText ? d => d : this._onInfiniteScrollTrigger}
            isLoading={this.props.loading || this.props.loadingMore || searchLoading}
          >
            {(searchResultsFormatted && searchText ? searchResultsFormatted : (this.props.posts || [])).map(p => <AdminPostCard post={p} key={p.id}/>)}
          </InfiniteScrollView>
        </div>
      </div>
    );
  }
}
