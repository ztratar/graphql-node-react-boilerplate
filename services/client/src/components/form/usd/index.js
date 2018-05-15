import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind } from 'core-decorators'

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class USD extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired,
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
    placeholder: PropTypes.string,
    focus: PropTypes.any
  }
  static defaultProps = {
    onChange: d => d,
    value: '',
    className: '',
    size: 'md',
    background: 'white',
    placeholder: '',
    focus: undefined
  }
  constructor (props, context) {
    super(props, context);

    const value = props.value || '';

    const start = value.length;
    const end = value.length;

    this.state = {
      start,
      end
    };
  }
  componentDidMount () {
    if (this.props.focus !== undefined && this.props.focus !== false) this.refs.input.focus();
  }
  componentDidUpdate () {
    const { start, end } = this.state;

    this.refs.input.setSelectionRange(start, end);
  }

  @autobind
  _handleSalaryKeyDown (e) {
    const isAllowed = ((e.keyCode >= 48 && e.keyCode <= 57)
      || e.keyCode === 37 // left and right
      || e.keyCode === 39
      || (e.keyCode === 65 && e.metaKey) // command
      || e.keyCode === 9 // tab
      || e.keyCode === 8 // delete
      );
      if (!isAllowed) e.preventDefault();
      return isAllowed;
  }

  @autobind
  _getSalaryString (inputInt) {
    if (!inputInt) return '';
    if (typeof inputInt !== 'string') inputInt = inputInt.toString();
    inputInt = inputInt.replace(/\$/g, '').replace(/,/g, '');
    inputInt = parseInt(inputInt, 10).toString(); // If decimal places
    inputInt = inputInt.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

    return '$' + inputInt;
  }

  @autobind
  _onChange (e) {
    const oldValue = this.props.value;

    const tempI = e.currentTarget.value.replace(/\$/g, '').replace(/,/g, '');
    const newValue = this._getSalaryString(tempI);

    let start = e.currentTarget.selectionStart;
    let end = e.currentTarget.selectionEnd;

    if (oldValue.length < 1) {
      start = 2;
      end = 2;
    }

    const oldNumCommas = (this.props.value.match(/,/g) || []).length;
    const newNumCommas = (newValue.match(/,/g) || []).length;

    const diff = newValue.length - newNumCommas;

    if (newNumCommas > oldNumCommas) {
      start ++;
      end ++;
    } else if (newNumCommas < oldNumCommas) {
      start --;
      end --;
    }

    this.setState({
      start,
      end
    }, () => this.props.onChange(newValue));
  }

  render () {
    return (
      <input
        type='text'
        className={classNames('form-control', style.input, style[this.props.size], style[this.props.background], this.props.className)}
        onKeyDown={this._handleSalaryKeyDown}
        onChange={this._onChange}
        value={this._getSalaryString(this.props.value)}
        placeholder={this.props.placeholder}
        type={this.props.type}
        ref='input'
      />
    );
  }
}
