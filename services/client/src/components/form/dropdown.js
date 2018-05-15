import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './dropdown.css';

@withStyles(style)
export default class Dropdown extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any.isRequired,
      text: PropTypes.string.isRequired
    })),
    className: PropTypes.string,
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
    focus: PropTypes.any
  };
  static defaultProps = {
    onChange: d => d,
    value: '',
    className: '',
    size: 'md',
    background: 'white',
    options: [],
    focus: undefined
  };

  constructor (props, context) {
    super(props, context);
  }

  componentDidMount () {
    if (this.props.focus !== undefined && this.props.focus !== false) this.refs.select.focus();
  }

  @autobind
  _onChange (e) {
    e.preventDefault;
    this.props.onChange(e.target.value);
  }
  render () {
    return (
      <select
        className={classNames('form-control', style.dropdown, style[this.props.background], style[this.props.size], this.props.className)}
        onChange={this._onChange}
        value={this.props.value}
        tabIndex={this.props.tabIndex}
        ref='select'>

        <option key='-1' value='' disabled>-</option>
        {this.props.options.map((o, i) =>
          <option key={i} value={o.value}>{o.text}</option>
        )}

      </select>
    );
  }
}
