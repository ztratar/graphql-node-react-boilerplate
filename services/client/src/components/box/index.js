import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class Box extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return (
      <div className={classNames(style.box, this.props.className)}>{this.props.children}</div>
    );
  }
}
