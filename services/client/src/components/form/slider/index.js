import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import RcSlider from 'rc-slider';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class Slider extends PureComponent {
  static propTypes = {
    wrapperClassName: PropTypes.string
  };
  static defaultProps = {
    wrapperClassName: ''
  };

  constructor (props, context) {
    super(props, context);
  }

  render () {
    const {
      wrapperClassName,
      ...restProps
    } = this.props;

    return (
      <div className={classNames(style.slider, wrapperClassName)}>
        <RcSlider
          {...restProps}
        />
      </div>
    );
  }
}
