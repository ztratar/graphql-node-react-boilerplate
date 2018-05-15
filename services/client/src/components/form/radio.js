import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from '../../components/common/pure';
import style from './radio.css';

@withStyles(style)
export default class Radio extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string
  };
  static defaultProps = {
    onChange: d => D,
    checked: false,
    text: '',
    value: '',
    className: ''
  };

  constructor (props, context) {
    super(props, context);
  }

  @autobind
  _onChange (e) {
    //e.preventDefault();
    const value = this.props.value;
    const checked = !this.props.checked;
    this.props.onChange({
      value,
      checked
    });
  }

  render () {
    return (
      <label className={classNames('radio-inline', style.radio, this.props.className)}>
        <input
          type='radio'
          name={this.props.name}
          value={this.props.value}
          checked={this.props.checked}
          onChange={this._onChange}
        />
        <span>{this.props.text}</span>
      </label>
    );
  }
}
