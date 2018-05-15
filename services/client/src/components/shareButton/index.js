import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import VerticalCenter from 'components/verticalCenter';
import ShareBar from 'components/shareBar';
import ButtonLink from 'components/buttonLink';

import analytics from '../../io/analytics';
import style from './index.css';

@connect(
  (state) => ({
    fqdn: state.app.get('fqdn')
  })
)
@withStyles(style)
export default class ShareButton extends PureComponent {
  static propTypes = {
    shareUrl: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.oneOf(['tn', 'sm', 'md', 'lg']),
    text: PropTypes.string,
    icon: PropTypes.number,
    background: PropTypes.string,
    btnClassName: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    size: 'tn',
    text: 'Share',
    icon: 61723,
    background: 'light',
    btnClassName: '',
    className: '',
    shareUrl: __CLIENT__ ? window.location.href : ''
  };

  constructor (props, context) {
    super(props, context);

    this.state = { showShareBar: false };
  }

  @autobind
  _clickShareButton () {
    this.setState({ showShareBar: !this.state.showShareBar });

    analytics.track('SHARE_OPENED', {
      currentUrl: window.location.pathname,
      shareUrl: this.props.shareUrl
    });
  }

  @autobind
  _mouseOutShareButton () {
    this.setState({ showShareBar: false });
  }

  render () {
    const url = `${this.props.fqdn}${this.props.shareUrl}`;
    return (
      <div className={classNames(style.shareButton, this.props.className)} onMouseLeave={this._mouseOutShareButton}>
        <ButtonLink
          text={this.props.text}
          icon={this.props.icon}
          size={this.props.size}
          background={this.props.background}
          className={classNames(style.shareButtonLink, this.props.btnClassName)}
          onClick={this._clickShareButton}
        />
        <div className={classNames(style.shareBarWrapper, this.state.showShareBar ? style.activeShareBarWrapper : '')}>
          <ShareBar
            shareUrl={url}
            title={this.props.title}
            size='lg'
            className={style.shareSidebar}
            buttonClassName={style.shareSocialButton}
          />
        </div>
      </div>
    )
  }
}
