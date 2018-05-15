import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './label.css';

const sizes = [
  'sm',
  'md',
  'lg',
  'vlg'
];

@withStyles(style)
export default class Label extends PureComponent {
  static propTypes = {
    size: PropTypes.string,
    centerText: PropTypes.bool
  };

  static defaultProps = {
    size: 'md',
    centerText: false
  };

  render () {
    let {
      size,
      className,
      centerText,
      ...restProps
    } = this.props;

    if (centerText) {
      return (
        <div className={className}>
          <div className={style.centerWrap}>
            <div>
              <label className={classNames(style.label, style[size])} {...restProps}></label>
            </div>
          </div>
        </div>
      );
    }

    return (
      <label className={classNames(style.label, style[size], className)} {...restProps}></label>
    );
  }
}
