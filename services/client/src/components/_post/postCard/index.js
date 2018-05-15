import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import removeMarkdown from 'remove-markdown';

import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from '../../../components/common/pure';

import style from './index.css';

@withStyles(style)
export default class PostCard extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  _getCoverStyle () {
    if (!this.props.post.Image) return {};
    return {
      backgroundImage: `url(${this.props.post.Image.key})`
    };
  }

  render () {
    const { post } = this.props;

    const postsLink = `/posts/${post.slug}`;

    return (
      <Link to={postsLink} className={style.postCard}>
        <div className={style.postImage} style={this._getCoverStyle()}></div>
        <div className={style.postContent}>
          <h4>{post.title}</h4>
          <p>{post.summary}</p>
        </div>
        { post.estimatedReadTime ? <span className={style.readTime}>{post.estimatedReadTime} minute read time</span> : null }
      </Link>
    );
  }
}
