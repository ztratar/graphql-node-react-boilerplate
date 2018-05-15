import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'underscore';
import { autobind } from 'core-decorators'
import ReactPhoneInput from 'react-phone-number-input';

import rrui from 'raw!react-phone-number-input/rrui.css';
import rpni from 'raw!react-phone-number-input/style.css';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './phone.css';

const sizes = [
  'sm',
  'md',
  'lg',
  'vlg'
];

const backgrounds = [
  'white',
  'greyLightest'
];

@withStyles(style)
export default class Phone extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    className: PropTypes.string,
    value: PropTypes.string,
    size: PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    background: PropTypes.oneOf([
      'white',
      'greyLightest'
    ]),
    disabled: PropTypes.bool
  }
  static defaultProps = {
    onChange: d => d,
    className: '',
    size: 'md',
    background: 'white',
    disabled: false
  }

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onChange (val) {
    this.props.onChange(val);
  }

  render () {
    return (
      <div className={classNames(style.phone, style[this.props.background], style[this.props.size], this.props.className)}>
        <ReactPhoneInput
          placeholder='Enter phone number'
          country='US'
          value={this.props.value}
          nativeExpanded={true}
          onChange={this._onChange}
          tabIndex={this.props.tabIndex}
        />
      </div>
    );
  }
}
