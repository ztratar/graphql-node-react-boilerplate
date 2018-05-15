import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class PageHeader extends PureComponent {
  render () {
    return (
      <div className={classNames(
        style.pageHeader,
        this.props.withTopPadding ? style.moreTopPadding : '',
        this.props.withBottomPadding ? style.moreBottomPadding : ''
      )}>
        <h1>{this.props.title}</h1>
        {this.props.text ?
        <p>
          {this.props.text}
        </p> : null}
      </div>
    );
  }
}
