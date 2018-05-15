import React from 'react';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import VerticalCenter from 'components/verticalCenter';
import ShareBar from 'components/shareBar';

import style from './index.css';

@withStyles(style)
export default class ShareSidebar extends PureComponent {
  static propTypes = {
    shareUrl: React.PropTypes.string,
    title: React.PropTypes.string,
    size: React.PropTypes.oneOf(['sm', 'md', 'lg'])
  };

  static defaultProps = {
    size: 'lg'
  };

  render () {
    return (
      <div className={style.shareSidebarWrapper}>
        <VerticalCenter>
          <ShareBar
            shareUrl={this.props.shareUrl}
            title={this.props.title}
            size={this.props.size}
            className={style.shareSidebar}
            buttonClassName={style.shareButton}
          />
        </VerticalCenter>
      </div>
    )
  }
}
