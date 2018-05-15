import React from 'react';
import classNames from 'classnames';
import {
  ShareButtons,
  generateShareIcon,
} from 'react-share';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import analytics from '../../io/analytics';
import style from './index.css';

const {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton
} = ShareButtons;

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const LinkedinIcon = generateShareIcon('linkedin');

const iconSizeMapper = {
  'sm': 24,
  'md': 32,
  'lg': 54
};

@withStyles(style)
export default class ShareBar extends PureComponent {
  static propTypes = {
    shareUrl: React.PropTypes.string,
    title: React.PropTypes.string,
    size: React.PropTypes.oneOf(['sm', 'md', 'lg']),
    className: React.PropTypes.string,
    buttonClassName: React.PropTypes.string
  };

  static defaultProps = {
    size: 'lg'
  };

  _beforeOnClick (shareType) {
    return new Promise((res, rej) => {
      analytics.track('SHARE_CLICKED', {
        type: shareType,
        currentUrl: window.location.pathname,
        shareUrl: this.props.shareUrl
      });
      res();
    });
  }

  render () {
    const shareUrl = this.props.shareUrl || (typeof window !== 'undefined' && window.location && window.location.href) || '';
    const title = this.props.title|| (typeof window !== 'undefined' && window.document && window.document.title) || '';
    const iconSize = iconSizeMapper[this.props.size];

    const shareUrlHasVars = shareUrl.indexOf('?') !== -1;

    const facebookUTM = (shareUrlHasVars ? '&' : '?') + 'utm_source=facebook&utm_medium=social&utm_campaign=sharebar';
    const twitterUTM = (shareUrlHasVars ? '&' : '?') + 'utm_source=twitter&utm_medium=social&utm_campaign=sharebar';
    const linkedinUTM = (shareUrlHasVars ? '&' : '?') + 'utm_source=linkedin&utm_medium=social&utm_campaign=sharebar';

    return (
      <div className={classNames(style.shareBar, style[this.props.size], this.props.className)}>
        <FacebookShareButton
          url={shareUrl + facebookUTM}
          title={title}
          beforeOnClick={this._beforeOnClick.bind(this, 'facebook')}
          className={classNames(style.shareButton, this.props.buttonClassName, style[`btn-${this.props.size}`], style.facebook)}>
          <FacebookIcon
            size={iconSize}
          />
        </FacebookShareButton>
        <TwitterShareButton
          url={shareUrl + twitterUTM}
          title={title}
          beforeOnClick={this._beforeOnClick.bind(this, 'twitter')}
          className={classNames(style.shareButton, this.props.buttonClassName, style[`btn-${this.props.size}`], style.twitter)}>
          <TwitterIcon
            size={iconSize}
          />
        </TwitterShareButton>
        <LinkedinShareButton
          url={shareUrl + linkedinUTM}
          title={title}
          beforeOnClick={this._beforeOnClick.bind(this, 'linkedin')}
          className={classNames(style.shareButton, this.props.buttonClassName, style[`btn-${this.props.size}`], style.linkedin)}>
          <LinkedinIcon
            size={iconSize}
          />
        </LinkedinShareButton>
      </div>
    )
  }
}
