import React from 'react';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class Loader extends PureComponent {
  render () {
    const loaderSizeMap = {
      'normal': style.loader,
      'small': style.smallLoader
    };

    return (
      <div
        className={classNames(style.loaderWrap, style[this.props.type])}
        style={this.props.style || {}}
      >
        <div className={loaderSizeMap[this.props.size || 'normal']}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
}
