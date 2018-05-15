import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { autobind } from 'core-decorators';
import removeMarkdown from 'remove-markdown';

import withStyles from 'isomorph-style-loader/lib/withStyles';

import CreateEditPostCard from '../createEditPostCard';
import ButtonLink from '../../../components/buttonLink';
import PureComponent from '../../../components/common/pure';

import style from './index.css';

@withStyles(style)
export default class AdminPostCard extends PureComponent {
  constructor (props, context) {
    super(props, context);

    this.state = {
      editMode: false
    };
  }

  @autobind
  _toggleEditMode () {
    this.setState({
      editMode: !this.state.editMode
    });
  }

  render () {
    const { post } = this.props;

    const readingTime = Math.floor((post.content && post.content.length || 1) / (300 * 5)) || 1;

    const noMark = removeMarkdown(post.content, {
      stripListHeader: true
    });

    const postsLink = (post && post.type === 'blog') ? `/blog/${post.slug}` : `/posts/${post.slug}`;

    if (this.state.editMode) {
      return (
        <div className={style.editPostWrapper}>
          <CreateEditPostCard
            post={post}
            onCancel={this._toggleEditMode}
            onUpdate={this._toggleEditMode}
          />
        </div>
      );
    }

    return (
      <div className={style.adminPostCard}>
        <h4>{post.title}</h4>
        <p>{noMark.slice(0, 180)}...</p>
        <span className={style.readTime}>{post.status} - {readingTime} read time</span>
        <div className={style.actions}>
          <ButtonLink
            text='Edit'
            background='gradientLight'
            onClick={this._toggleEditMode}
          />
          <ButtonLink
            text='View post'
            to={postsLink}
          />
        </div>
      </div>
    );
  }
}
