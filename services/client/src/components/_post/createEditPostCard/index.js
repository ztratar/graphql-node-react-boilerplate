import React from 'react';
import classNames from 'classnames';
import _ from 'underscore';
import { autobind } from 'core-decorators';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import PureComponent from 'components/common/pure';
import Img from 'components/img';
import ButtonLink from 'components/buttonLink';
import {
  Form,
  Input,
  Label,
  Textarea,
  Dropdown,
  UploadButton
} from 'components/form';
import TopicAutocomplete from 'components/autocomplete/topic';
import Tag from 'components/tag';

import { toBase64 } from 'lib/files';
import form from '../../../decorators/form';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import style from './index.css';

@graphql(gql`
  mutation createPost ($input: PostInput!) {
    post: createPost (input: $input) {
      id
      slug
      title
      content
      summary
      status
      createdAt
      updatedAt
      Image {
        id
        key
      }
      Creator {
        id
        name
      }
      Topics {
        id
        title
      }
    }
  }
`, {
  props: ({
    mutate
  }) => ({
    createPost: (data) => mutate({
      variables: {
        input: data
      },
      updateQueries: {
        getPosts: (previousResult, { mutationResult }) => {
          if (!mutationResult || !mutationResult.data || !mutationResult.data.post) {
            return previousResult;
          }

          const post = mutationResult.data.post;

          const posts = _.sortBy(_.uniq(
            [ post ].concat(previousResult.posts),
            ({ id }) => id
          ), p => -1 * Date.parse(p.updatedAt || p.createdAt));

          const returnObj = Object.assign({}, previousResult, {
            posts
          });

          return returnObj;
        }
      }
    })
  })
})
@graphql(gql`
  mutation createPhoto ($input: FileInput!) {
    photo: createPhoto (input: $input) {
      id
      key
    }
  }
`, {
  props: ({
    mutate
  }) => ({
    createPhoto: (data) => mutate({
      variables: {
        input: data
      }
    })
  })
})
@graphql(gql`
  mutation updatePost ($input: PostInput!) {
    post: updatePost (input: $input) {
      id
      slug
      title
      content
      summary
      status
      createdAt
      updatedAt
      Image {
        id
        key
      }
      Creator {
        id
        name
      }
      Topics {
        id
        title
      }
    }
  }
`, {
  props: ({
    mutate
  }) => ({
    updatePost: (data) => mutate({
      variables: {
        input: data
      },
      updateQueries: {
        getPosts: (previousResult, { mutationResult }) => {
          if (!mutationResult || !mutationResult.data || !mutationResult.data.post) {
            return previousResult;
          }

          const post = mutationResult.data.post;

          const posts = _.sortBy(_.uniq(
            [ post ].concat(previousResult.posts),
            ({ id }) => id
          ), p => -1 * Date.parse(p.updatedAt || p.createdAt));

          const returnObj = Object.assign({}, previousResult, {
            posts
          });

          return returnObj;
        }
      }
    })
  })
})
@form({
  id: 'createPostForm',
  initialState: ({ post }) => {
    if (!post) return {};
    return {
      post
    }
  }
})
@withStyles(style)
export default class CreateEditPostCard extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  @autobind
  async _onImageChange (e) {
    toBase64(e[0]).then(r => {
      this.props.setInForm(['post', 'Image'], {
        content: r
      });
    }, e => e);
  }

  @autobind
  async _onAddPhotoToPost (e) {
    const base64 = await toBase64(e[0]);

    try {
      const { data: { photo } } = await this.props.createPhoto({
        content: base64
      });

      const currentContent = this.props.form.getIn(['post', 'content']);

      this.props.setInForm(['post', 'content'], (currentContent || '') + `\n\n![AltText](${photo.key})`);
    } catch (e) {}
  }

  @autobind
  _onTitleChange (newVal) {
    this.props.setInForm(['post', 'title'], newVal);
  }

  @autobind
  _onCreatorChange (newVal) {
    this.props.setInForm(['post', 'Creator', 'id'], newVal);
  }

  @autobind
  _cancel (ev) {
    ev.preventDefault();

    this.props.setInForm(['post'], {});

    if (this.props.onCancel) {
      this.props.onCancel(ev);
    }
  }

  @autobind
  _createPost (e) {
    e.preventDefault();

    this.props.createPost(this._serializePostObject(this.props.form.get('post').toJSON())).then(r => {
      if (this.props.onCreate) this.props.onCreate(r.data.post);
    }, e => e);
  }

  @autobind
  _updatePost (e) {
    e.preventDefault();

    this.props.updatePost(this._serializePostObject(this.props.form.get('post').toJSON())).then(r => {
      if (this.props.onUpdate) this.props.onUpdate(r.data.post);
    }, e => e);
  }

  @autobind
  _onPostChange (content) {
    this.props.setInForm(['post', 'content'], content);
  }

  @autobind
  _onSummaryChange (summary) {
    this.props.setInForm(['post', 'summary'], summary);
  }

  @autobind
  _onStatusChange (status) {
    this.props.setInForm(['post', 'status'], status);
  }

  @autobind
  _onAddTopic (topic) {
    let items = this.props.form.getIn(['post', 'Topics']);

    items = items && items.toJSON ? items.toJSON() : [];

    items.push({
      ...topic
    });

    items = _.uniq(items, i => i.id || i.title);

    this.props.setInForm(['post', 'Topics'], items);

    return false;
  }

  @autobind
  _onRemoveTopic (topic) {
    let items = this.props.form.getIn(['post', 'Topics']);

    items = items && items.toJSON ? items.toJSON() : [];

    items = _.filter(items, i => i.id !== topic.id && i.title !== topic.title);
    items = _.uniq(items, i => i.id || i.title);

    this.props.setInForm(['post', 'Topics'], items);

    return false;
  }

  _serializePostObject(post) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      status: post.status,
      Image: post.Image ? {
        id: post.Image.id,
        content: post.Image.content
      } : undefined,
      Creator: post.Creator ? {
        id: post.Creator.id
      } : undefined,
      Topics: post.Topics ? post.Topics.map(p => ({
        id: p.id && p.id.indexOf('CREATE_') !== -1 ? undefined : p.id,
        title: p.title
      })) : []
    };
  }

  render () {
    let headerStyle = {
      backgroundSize: 'cover'
    };

    const image = this.props.form.getIn(['post', 'Image', 'content'])
     || this.props.form.getIn(['post', 'Image', 'key']);

    if (image) headerStyle['backgroundImage'] = `url(${image})`;

    return (
      <div className={classNames(style.createEditPostCard, this.props.className)}>
        <div className={style.card}>
          <div className={style.enhancedHeader} style={headerStyle}>
            <UploadButton
              name='photo'
              text={image ? 'Change photo' : 'Upload photo'}
              onChange={this._onImageChange}
              className={style.uploadButton}
            />
            <div className={style.titleWrapper}>
              <Input
                className={style.titleField}
                ref='title'
                placeholder='Add a title to your post...'
                value={this.props.form.getIn(['post', 'title'])}
                onChange={this._onTitleChange}
              />
            </div>
          </div>
          <div className={style.textWrap}>
            <UploadButton
              name='addPhotoTo'
              onChange={this._onAddPhotoToPost}
              className={style.addPhotoButton}
              icon='61765'
            />
            <Textarea
              placeholder='Type markdown...'
              rows={10}
              value={this.props.form.getIn(['post', 'content'])}
              onChange={this._onPostChange}
              className={style.textarea}
            />
          </div>
          <div className={style.metaInfo}>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Summary</Label>
              <div className='col-xs-12 col-sm-8'>
                <Input
                  placeholder='Add a summary...'
                  value={this.props.form.getIn(['post', 'summary'])}
                  onChange={this._onSummaryChange}
                  background='greyLightest'
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Status</Label>
              <div className='col-xs-12 col-sm-8'>
                <Dropdown
                  size='sm'
                  options={[{
                    value: 'unlisted',
                    text: 'Unlisted'
                  }, {
                    value: 'public',
                    text: 'Public'
                  }, {
                    value: 'loggedin',
                    text: 'Logged In (Free)'
                  }, {
                    value: 'paid',
                    text: 'Logged In (Paid)'
                  }]}
                  value={this.props.form.getIn(['post', 'status'])}
                  onChange={this._onStatusChange}
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Creator Id</Label>
              <div className='col-xs-12 col-sm-8'>
                <Input
                  placeholder='Add a creator id...'
                  value={this.props.form.getIn(['post', 'Creator', 'id'])}
                  onChange={this._onCreatorChange}
                  background='greyLightest'
                />
              </div>
            </div>
            <div className='form-group'>
              <Label centerText={true} className='col-xs-12 col-sm-4'>Topics</Label>
              <div className='col-xs-12 col-sm-8'>
                <TopicAutocomplete
                  background='greyLightest'
                  placeholder='Add a topic...'
                  name='active-topic-autocomplete'
                  onSelect={this._onAddTopic}
                />
                <div className={style.topics}>
                  {this.props.form.getIn(['post', 'Topics']) && this.props.form.getIn(['post', 'Topics'])
                    .toJSON()
                    .map((t, i) => <Tag key={i} text={t.title} onCancel={() => this._onRemoveTopic(t)}/>)}
                </div>
              </div>
            </div>
          </div>
          <div className={style.actionBar}>
            <ButtonLink
              text='Cancel'
              background='gradientLight'
              onClick={this._cancel}
              size='sm'
              className={style.cancelButton}
            />
            <ButtonLink
              text={this.props.post ? 'Save' : 'Post'}
              size='sm'
              className={style.postButton}
              onClick={this.props.post && this.props.post.id ? this._updatePost : this._createPost}
            />
          </div>
        </div>
      </div>
    );
  }
}
