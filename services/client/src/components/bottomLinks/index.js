import React from 'react';
import classNames from 'classnames';

import { Link } from 'react-router';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class BottomLinks extends PureComponent {
  render () {
    return (
      <div className={style.bottomLinks}>
        {this.props.items.map((item, key) =>
          <Link key={key} to={item.href}>{item.displayText}</Link>
        )}
      </div>
    );
  }
}
