import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class Switch extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    showOnOff: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    defaultChecked: false,
    disabled: false,
    onChange: d => d,
    showOnOff: true
  };

  constructor (props, context) {
    super(props, context);

    let checked = false;

    if ('checked' in props) {
      checked = !!props.checked;
    } else {
      checked = !!props.defaultChecked;
    }

    this.state = {
      checked
    };
  }

  componentWillReceiveProps (nextProps) {
    if ('checked' in nextProps) {
      this.setState({
        checked: !!nextProps.checked
      });
    }
  }

  @autobind
  _setChecked (checked) {
    if (this.props.disabled) {
      return;
    }
    if (!('checked' in this.props)) {
      this.setState({
        checked,
      });
    }
    this.props.onChange(checked);
  }

  @autobind
  _toggle () {
    const checked = !this.state.checked;
    this._setChecked(checked);
  }

  @autobind
  _handleKeyDown (e) {
    if (e.keyCode === 37) {
      this._setChecked(false);
    }
    if (e.keyCode === 39) {
      this._setChecked(true);
    }
  }

  @autobind
  _handleMouseUp (e) {
    if (this.refs.node) {
      this.refs.node.blur();
    }
    if (this.props.onMouseUp) {
      this.props.onMouseUp(e);
    }
  }

  @autobind
  _onClick (e) {
    this._toggle(e);
  }

  render () {
    const {
      className,
      disabled,
      showOnOff,
      ...restProps
    } = this.props;

    const checked = this.state.checked;

    const switchClassName = classNames(
      style.switch,
      showOnOff ? style.switchWithText : '',
      checked ? style.checked : '',
      disabled ? style.disabled : ''
    );

    const innerClassName = classNames(
      style.inner,
      checked ? style.innerChecked : '',
      disabled ? style.innerDisabled : ''
    );

    return (
      <span className={classNames(className, style.switchWrapper, disabled ? style.disabledSwitch : '')}>
        {showOnOff ? <a onClick={this._setChecked.bind(this, false)}>Off</a> : null}
        <span {...restProps}
          className={switchClassName}
          tabIndex='0'
          ref='node'
          onKeyDown={this._handleKeyDown}
          onMouseUp={this._handleMouseUp}
          onClick={this._onClick}
        >
          <span className={innerClassName}></span>
        </span>
        {showOnOff ? <a onClick={this._setChecked.bind(this, true)}>On</a> : null}
      </span>
    );
  }
}
