import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'underscore';
import { autobind } from 'core-decorators'

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './input.css';

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
export default class Input extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    value: PropTypes.any,
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
    focus: PropTypes.any,
    disabled: PropTypes.bool,
    controlled: PropTypes.bool,
    disableFormStateControls: PropTypes.bool
  }
  static defaultProps = {
    type: 'text',
    onChange: d => d,
    onFocus: d => d,
    onBlur: d => d,
    onKeyUp: d => d,
    onKeyDown: d => d,
    value: '',
    className: '',
    size: 'md',
    background: 'white',
    placeholder: '',
    focus: undefined,
    disabled: false,
    disableFormStateControls: false,
    controlled: true
  }

  constructor (props, context) {
    super(props, context);

    this.state = {
      curPos: (props.value || '').length,
      currentlyFocused: false,
      tempDisabled: true // for mobile forms from tap events
    };
    this._isMounted = false;
  }

  componentDidMount () {
    this._isMounted = true;
    _.delay(() => this._isMounted ? this.setState({ tempDisabled: false }, () => {
      if (this.props.focus !== undefined && this.props.focus !== false) this.refs.input.focus();
    }) : null, 150);
  }

  componentWillUnmount () {
    this._isMounted = false;
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.focus && nextProps.focus) {
      _.delay(() => { this._isMounted ? this.refs.input.focus() : null }, 150);
    }
  }

  componentDidUpdate () {
    if (this.props.type.toLowerCase() === 'text' && !this.props.disableFormStateControls) {
      if (this.state.currentlyFocused) {
        this.refs.input.setSelectionRange(this.state.curPos, this.state.curPos);
      }
    }
  }

  @autobind
  _onChange (e) {
    if (!this._isMounted) return;

    const val = e.target.value;
    if (this.props.type.toLowerCase() === 'text' && !this.props.disableFormStateControls) {
      e.preventDefault();
      const curPos = e.target.selectionEnd;
      return this.setState({
        curPos
      }, () => {
        this.props.onChange(val)
      });
    }
    this.props.onChange(val);
  }

  @autobind
  _onFocus (e) {
    if (!this._isMounted) return;
    this.props.onFocus(e);
    if (!this.props.disableFormStateControls) this.setState({ currentlyFocused: true });
  }

  @autobind
  _onBlur (e) {
    if (!this._isMounted) return;
    this.props.onBlur(e);
    if (!this.props.disableFormStateControls) this.setState({ currentlyFocused: false });
  }

  @autobind
  _onKeyUp (e) {
    if (!this._isMounted) return;
    this.props.onKeyUp(e);
  }

  @autobind
  _onKeyDown (e) {
    if (!this._isMounted) return;
    this.props.onKeyDown(e);
  }

  render () {

    const variableProps = !this.props.controlled ? {
      name: this.props.name || undefined
    } : {
      value: this.props.value,
      name: this.props.name || undefined,
      onChange: this._onChange
    };

    return (
      <input
        type={this.props.type}
        disabled={this.props.disabled || this.state.tempDisabled}
        className={classNames('form-control', style.input, style[this.props.size], style[this.props.background], this.props.className)}
        onFocus={this._onFocus}
        onBlur={this._onBlur}
        onKeyUp={this._onKeyUp}
        onKeyDown={this._onKeyDown}
        placeholder={this.props.placeholder}
        ref='input'
        tabIndex={this.props.tabIndex}
        {...variableProps}
      />
    );
  }
}
