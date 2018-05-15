import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class VerticalCenter extends PureComponent {
  render () {
    return (
      <div className={classNames(style.verticalCenter, this.props.className)}>
        <div className={style.verticalCenterContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
