import React from 'react';
import { autobind } from 'core-decorators';
import classNames from 'classnames';
import _ from 'underscore';
import { Link } from 'react-router';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import gql from 'graphql-tag';

import fragment from 'decorators/fragment';

import {
  cropImageUpload
} from '../../lib/files';

import PureComponent from '../common/pure';
import UploadButton from '../form/uploadButton';
import Img from '../img';

import style from './index.css';
import defaultAvatar from '../../assets/images/defaultAvatar.jpg';

@fragment('default', gql`
  fragment AvatarDefaultFragment on File {
    id
    key
  }
`)
@withStyles(style)
export default class Avatar extends PureComponent {

  static propTypes = {
    src: React.PropTypes.string,
    size: React.PropTypes.string,
    className: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    href: React.PropTypes.any,
    disabled: React.PropTypes.bool
  };

  static defaultProps = {
    src: defaultAvatar,
    size: 'lg',
    className: '',
    href: undefined,
    disabled: false
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  async _onChange (e) {
    this.props.onChange(await cropImageUpload(e.target.files[0], 200, 200));
  }

  render () {
    return (
      <div className={classNames(style.avatar, style[this.props.size], this.props.className)}>
        <Img src={this.props.src} defaultSrc={defaultAvatar} className={style[this.props.size]}/>
        {_.isString(this.props.href) ? (
          <div>
            <Link
              className={style[this.props.size]}
              to={this.props.href}
            />
          </div>
        ) : _.isFunction(this.props.onClick) ? (
          <div>
            <input
              type='button'
              className={style[this.props.size]}
              onClick={this.props.onClick}
            />
          </div>
        ) : _.isFunction(this.props.onChange) ? (
          <div>
            <input type='file' onChange={this._onChange} accept='image/*'/>
            <div className={classNames(style.editOverlay, 'avatar-edit-overlay')}>
              <i className='icon'>{String.fromCharCode(61765)}</i>
            </div>
          </div>
        ) : null }
      </div>
    );
  }
}
