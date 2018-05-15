import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './checkbox.css';

@withStyles(style)
export default class Checkbox extends PureComponent {
  static propTypes = {
    text: PropTypes.string.isRequired,
    size: PropTypes.oneOf([
      'md',
      'sm'
    ]),
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    checked: PropTypes.bool.isRequired,
    className: PropTypes.string
  };
  static defaultProps = {
    text: 'missing text',
    size: 'md',
    onChange: d => d,
    value: '',
    checked: false,
    className: ''
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onChange (e) {
    this.props.onChange(e.target.checked, e.target.value);
  }

  render () {
    let passedProps = {
      name: this.props.name
    };

    const className = classNames(
      style.checkbox,
      style[this.props.size],
      this.props.className
    );

    return (
      <label className={className}>
        <input type='checkbox' value={this.props.value} checked={this.props.checked} onChange={this._onChange}/> <span>{this.props.text}</span>
      </label>
    );
  }
}
