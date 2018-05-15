import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'underscore';
import AutosizeTextarea from 'react-textarea-autosize';
import { autobind } from 'core-decorators';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './textarea.css';

const backgrounds = [
  'white',
  'greyLightest'
];

@withStyles(style)
export default class Textarea extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onFocus: PropTypes.func,
    onHeightChange: PropTypes.func,
    onBlur: PropTypes.func,
    value: PropTypes.any.isRequired,
    rows: PropTypes.number,
    className: PropTypes.string,
    background: PropTypes.oneOf([
      'white',
      'greyLightest'
    ]),
    placeholder: PropTypes.string,
    focus: PropTypes.any,
    disabled: PropTypes.bool,
    disableFormStateControls: PropTypes.bool
  };

  static defaultProps = {
    onChange: d => d,
    onFocus: d => d,
    onBlur: d => d,
    onKeyDown: d => d,
    onKeyUp: d => d,
    onHeightChange: d => d,
    value: '',
    rows: 1,
    className: '',
    background: 'white',
    placeholder: '',
    focus: undefined,
    disabled: false,
    disableFormStateControls: false
  };

  constructor (props, context) {
    super(props, context);
    this.state = {
      curPos: (props.value || '').length,
      tempDisabled: true // hack for mobile browser tap events
    };
    this._isMounted = false;
  }

  componentDidMount () {
    this._isMounted = true;
    _.delay(() => this._isMounted ? this.setState({ tempDisabled: false }, () => {
      if (this.props.focus !== undefined && this.props.focus !== false) this._inputRef.focus();
    }) : null, 150);
  }

  componentWillUnmount () {
    this._isMounted = false;
  }

  componentDidUpdate () {
    if (!this.props.disableFormStateControls) {
      if (this.state.currentlyFocused && this._inputRef) {
        this._inputRef.setSelectionRange(this.state.curPos, this.state.curPos);
      }
    }
  }

  @autobind
  _onChange (e) {
    if (!this._isMounted) return;

    const val = e.target.value;
    if (!this.props.disableFormStateControls) {
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
  _assignInputRef (node) {
    this._inputRef = node;
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

  @autobind
  _onAssignInputRef (node) {
    this._inputRef = node;
  }

  render () {
    return (
      <div className={style.textareaWrap}>
        <AutosizeTextarea
          ref='textarea'
          inputRef={this._onAssignInputRef}
          className={classNames(style.textarea, style[this.props.background], this.props.className)}
          placeholder={this.props.placeholder}
          minRows={this.props.rows}
          disabled={this.props.disabled}
          value={this.props.value}
          inputRef={this._assignInputRef}
          onChange={this._onChange}
          onFocus={this._onFocus}
          onBlur={this._onBlur}
          onKeyUp={this._onKeyUp}
          onKeyDown={this._onKeyDown}
          onHeightChange={this.props.onHeightChange}
        />
      </div>
    );
  }
}
