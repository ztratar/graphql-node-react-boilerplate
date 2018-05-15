import React from 'react';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class NumberedPresentationList extends PureComponent {
  static defaultProps = {
    bubbleColor: 'grey',
    size: 'md'
  };

  render () {
    return (
      <div className={classNames(
        style.numberedPresentationList,
        style['numberedPresentationList-color-' + this.props.bubbleColor],
        style['numberedPresentationList-size-' + this.props.size]
      )}>
        {this.props.list.map((listItem, ind) =>
        <div className={classNames(
          style.listItem,
          style['listItem-size-' + this.props.size]
        )} key={ind}>
          <span className={classNames(
            style.listNumber,
            style['listNumber-color-' + this.props.bubbleColor],
            style['listNumber-size-' + this.props.size],
          )}>{ind + 1}</span>
          <span className={classNames(
            style.listTitle,
            listItem.done ? style.listTitleDone : ''
          )}>{listItem.title}</span>
          {listItem.description && !listItem.done ?
          <span className={style.listDescription}>
            {listItem.description}
          </span> : null}
        </div>)}
      </div>
    );
  }
}
