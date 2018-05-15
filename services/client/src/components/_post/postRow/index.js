import React from 'react';
import classNames from 'classnames';
import { autobind, throttle } from 'core-decorators';
import { Link } from 'react-router';
import ReactMarkdown from 'react-markdown';
import removeMarkdown from 'remove-markdown';

import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from 'components/common/pure';
import ButtonLink from 'components/buttonLink';
import ButtonGroup from 'components/buttonGroup';
import Modal from 'components/modal';

import form from 'decorators/form';

import style from './index.css';

@form({
  initialState: props => ({
    showFullPreview: false
  })
})
@withStyles(style)
export default class PostRow extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  _getCoverStyle () {
    if (!this.props.post.Image) return {};
    return {
      backgroundImage: `url(${this.props.post.Image.key})`
    };
  }

  @autobind
  _onClickUsePost () {
    this.props.onPostSelected(this.props.post);
  }

  @autobind
  _onClickRemovePost () {
    this.props.onPostRemoved(this.props.post);
  }

  @autobind
  _onClickEditPost () {
    this.props.onPostEditClicked(this.props.post);
  }

  @autobind
  _onMouseOver () {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = undefined;
    }

    this.props.setInForm(['showFullPreview'], true);
  }

  @autobind
  _onMouseLeave () {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }

    this.leaveTimeout = setTimeout(() => {
      this.props.setInForm(['showFullPreview'], false);
    }, 10);
  }

  render () {
    const { post } = this.props;
    const selectedPostIds = (this.props.selectedPosts || []).map(p => p.id);

    return (
      <div
        className={style.postRow}
        onMouseOver={this._onMouseOver}
        onMouseLeave={this._onMouseLeave}
      >
        <span className={style.previewText}>
          <h6>{post.title}</h6>
          <p>{post.summary}</p>
         </span>
        <div className={classNames(style.options, 'property-options')}>
        { _.contains(selectedPostIds, post.id) ? (
          <ButtonLink
            size='tn'
            icon={61956}
            background='red'
            onClick={this._onClickRemovePost}
          />
        ) : (
          <ButtonLink
            icon={61943}
            size='tn'
            onClick={this._onClickUsePost}
          />
        )}
        </div>
        {this.props.form.get('showFullPreview') ? <Modal
          className={classNames(style.fullPreview, 'full-snippet-preview')}
          isOpen={true}
          blurBackground={false}
          showClose={false}
          textAlign='left'
          overlayClassName={style.fullPreviewOverlay}
          onMouseOver={this._onMouseOver}
          onMouseLeave={this._onMouseLeave}
        >
          <ButtonLink
            text='Edit post'
            size='sm'
            className={style.editPostButton}
            onClick={this._onClickEditPost}
          />
          <div className={style.postImage} style={this._getCoverStyle()}></div>
          <div className={style.postContent}>
            <h4>{post.title}</h4>
            <ReactMarkdown
              className="article-contents"
              source={post.content}
            />
          </div>
        </Modal> : null}
      </div>
    );
  }
}

