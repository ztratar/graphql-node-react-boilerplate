import React from 'react';
import classNames from 'classnames';
import { push } from 'react-router-redux';
import Sticky from 'react-stickynode';
import { Link, withRouter } from 'react-router';
import ReactMarkdown from 'react-markdown';
import ReactScroll from 'react-scroll';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { autobind } from 'core-decorators';
import gql from 'graphql-tag';
import moment from 'moment';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import defaultAvatar from '../../assets/images/defaultAvatar.jpg';
import form from '../../decorators/form';
import PureComponent from '../../components/common/pure';
import ButtonLink from '../../components/buttonLink';
import VerticalCenter from '../../components/verticalCenter';
import Loader from '../../components/loader';
import Img from '../../components/img';
import Avatar from '../../components/avatar';
import ShareBar from '../../components/shareBar';
import ShareSidebar from '../../components/shareSidebar';
import PostCard from 'components/_post/postCard';
import Tag from 'components/tag';
import SignUpModal from 'components/signUpModal';
import { set, revert } from '../../state/redux/actions/app/meta';

import style from './index.css';

@connect(
  state => ({
    hasToken: !!state.app.getIn(['auth', 'token'])
  }),
  (dispatch, props) => ({
    actions: {
      setMeta: (meta) => dispatch(set(meta)),
      revertMeta: () => dispatch(revert())
    }
  })
)
@withRouter
@graphql(gql`
  query getPost ($query: PostQueryInput!){
    post: getPostBySlug (query: $query) {
      id
      slug
      title
      content
      updatedAt
      createdAt
      Image {
        id
        key
      }
      Creator {
        id
        name
        bio
        Avatar {
          id
          key
        }
      }
      Topics {
        id
        title
        slug
      }
    }
    posts: getTopPosts {
      id
      slug
      title
      summary
      estimatedReadTime
      Image {
        id
        key
      }
    }
  }
`, {
  options: ({
    params: {
      postSlug: slug
    }
  }) => ({
    variables: {
      query: {
        slug
      }
    }
  }),
  props: ({
    ownProps: {
      actions: {
        setMeta
      },
      router
    },
    data: {
      loading,
      post,
      posts,
      error
    }
  }) => {
    if (post) {
      const readingTime = Math.floor((post.content && post.content.length || 1) / (300 * 5)) || 1;

      setMeta({
        title: post.title,
        image: (post.Image && post.Image.key) || null,
        description: post && post.Creator && post.Creator.name ? `Written by ${post.Creator.name} - ${readingTime} minute read` : undefined
      });
    } else if (!loading) {
      // If no post and not loading, a post has not been found
      router.push('/posts');
    }

    return {
      loading,
      post,
      posts,
      error
    }
  }
})
@form({
  id: 'post',
  initialState: {
    showShareOptions: false
  }
})
@withStyles(style)
export default class PostContainer extends PureComponent {
  static defaultProps = {
    loading: true,
    post: {}
  };

  static getHeadingName (children) {
    return children.join('').toLowerCase().replace(/\s/g,'-');
  }

  constructor (props, context) {
    super(props, context);

    this.state = {
      shakeSignupCTA: false,
      showSignupModal: false
    };
  }

  componentDidMount () {
    this._shakeTimeout = setTimeout(() => {
      this.setState({ shakeSignupCTA: true });
    }, 1000 * 60);

    this._signupTimeout = setTimeout(() => {
      this.setState({ showSignupModal: true });
    }, 1000 * 7);
  }

  componentWillUnmount () {
    this.props.actions.revertMeta();
    clearTimeout(this._shakeTimeout);
    clearTimeout(this._signupTimeout);
  }

  @autobind
  _showShareOptions (e) {
    e.preventDefault();

    this.props.setInForm(['showShareOptions'], !this.props.form.get('showShareOptions'));
  }

  @autobind
  _renderArticleHeading (props) {
    if (props.level === 2) {
      return (
        <h2>
          <ReactScroll.Element name={PostContainer.getHeadingName(props.children)}>
            {props.children}
          </ReactScroll.Element>
        </h2>
      )
    } else {
      return (
        <h1>
          <ReactScroll.Element name={PostContainer.getHeadingName(props.children)}>
            {props.children}
          </ReactScroll.Element>
        </h1>
      )
    }
  }

  @autobind
  _renderParagraph (props) {
    return (
      <p>
        {props.children}
      </p>
    );
  }

  @autobind
  _renderTableOfContentsHeading (props) {
    if (props.level !== 2) return null;
    return (
      <ReactScroll.Link
        to={PostContainer.getHeadingName(props.children)}
        smooth={true}
        duration={600}
        offset={-120}>
        {props.children}
      </ReactScroll.Link>
    );
  }

  _getCoverStyle () {
    if (!this.props.post.Image) return {};
    return {
      backgroundImage: `url(${this.props.post.Image.key})`
    };
  }

  @autobind
  _onClose () {
    this.setState({ showSignupModal: true });
  }

  render () {
    const { post } = this.props;

    if (this.props.loading || !post) {
      return (
        <Loader type="pageLoader"/>
      );
    }

    const timeToShow = Date.parse(post.updatedAt) > Date.parse(post.createdAt) + 20
      ? `Updated ${moment(post.updatedAt).fromNow()}`
      : `Posted ${moment(post.createdAt).fromNow()}`;

    return (
      <div className={style.postArticlePage}>
        <SignUpModal
          isOpen={this.state.showSignupModal && !this.props.hasToken}
          leadGenerationStyle={true}
          location={this.props.location}
          onClose={this._onClose}
        />
        <ShareSidebar title={post.title}/>
        <div className="article-header">
          <div className="bg-img" style={this._getCoverStyle()}></div>
          <VerticalCenter className={classNames(style.articleHeaderContent, !this.props.hasToken ? style.publicArticleHeaderContent : '')}>
            <h1>{post.title}</h1>
            <p className={style.extraHeaderInfo}>
              { post.Topics && post.Topics.length ? <span className={style.topics}>
                {post.Topics.map(t => (
                  <ButtonLink
                    key={t.id}
                    text={t.title}
                    to={`/posts/topic/${t.slug}`}
                    size='tn'
                  />
                ))}
              </span> : null}
              <span className={style.timeToShow}>{timeToShow}</span>
            </p>
          </VerticalCenter>
        </div>
        <div className="article-contents-wrapper clearfix" id='articleContent'>
          <div className={style.articleMainCol}>
            <ReactMarkdown
              className="article-contents"
              source={post.content}
              renderers={{
                Heading: this._renderArticleHeading,
                Paragraph: this._renderParagraph
              }}
            />
            <div className="article-share-section well">
              <span>Think others would find this valuable?</span>
              {!this.props.form.get('showShareOptions') ? (
                <a href="#" className="btn btn-primary share-article pull-right" onClick={this._showShareOptions}>
                  <i className="icon">&#61740;</i>
                  Share article
                </a>
              ) : (
                <ShareBar size='md' title={post.title} className={style.shareBar}/>
              )}
            </div>
          </div>
          <div className={style.articleSideCol}>
            <div className="about-author-container">
              <Avatar src={post.Creator.Avatar ? post.Creator.Avatar.key : defaultAvatar} className={style.authorAvatar}/>
              <h4>{post.Creator.name}</h4>
              <p>{post.Creator.bio.length > 200 ? post.Creator.bio.slice(0,197) + '...' : post.Creator.bio}</p>
            </div>
            <Sticky top={128} className={style.rightStick} bottomBoundary='#articleContent'>
              {post.content && (post.content.indexOf('##') !== -1 || post.content.indexOf('---') !== -1) ? <div className="table-of-contents">
                <h3>Table of Contents</h3>
                <div className="table-of-contents-container">
                  <ReactMarkdown
                    className="table-of-contents"
                    source={post.content}
                    allowedTypes={['Heading', 'Text']}
                    renderers={{
                      Heading: this._renderTableOfContentsHeading
                    }}
                  />
                </div>
              </div> : null}
              {!this.props.hasToken ? (
                <div className={classNames(style.signupCTA, this.state.shakeSignupCTA ? style.applySignupShake : '')}>
                  <h3>Great content, delivered to your inbox</h3>
                  <p>Keep your career moving forward.</p>
                  <ButtonLink
                    text='Sign up'
                    to='/'
                    background='green'
                    uppercase={true}
                    icon='61812'
                    iconPlacement='right'
                  />
                </div>
              ) : null}
            </Sticky>
          </div>
        </div>
        <div className={style.nextArticles} id=''>
          <h2>More posts from Boost</h2>
          <div className='container'>
            <div className={style.postWrapper}>
              {this.props.posts && this.props.posts.map(p => (
                <PostCard post={p} key={p.id}/>
              ))}
              <ButtonLink
                text='See all posts'
                size='md'
                className={style.explorePostsButton}
                to='/posts'
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
