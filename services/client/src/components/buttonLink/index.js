import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import { Link } from 'react-router';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';

import style from './index.css';

@withStyles(style)
export default class ButtonLink extends PureComponent {
  static propTypes = {
    text: React.PropTypes.string,
    type: React.PropTypes.oneOf(['a', 'button', 'submit']),
    size: React.PropTypes.oneOf([
      'tn',
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    background: React.PropTypes.oneOf([
      'gradientLight',
      'gradientDark',
      'gradientBlue',
      'gradientGreen',
      'light',
      'clear',
      'grey',
      'dark',
      'blue',
      'orange',
      'green',
      'red'
    ]),
    icon: React.PropTypes.any,
    iconPlacement: React.PropTypes.oneOf(['left', 'right']),
    uppercase: React.PropTypes.bool,
    loading: React.PropTypes.bool,
    loadingText: React.PropTypes.string,
    tooltip: React.PropTypes.string,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool
  };

  static defaultProps = {
    type: 'a',
    uppercase: false,
    size: 'md',
    icon: '',
    iconPlacement: 'left',
    background: 'blue',
    className: '',
    loading: false,
    loadingText: 'Loading...',
    tooltip: '',
    disabled: false
  }

  constructor (props, context) {
    super(props, context);

    this.state = {
      hasBeenHit: false
    };
  }

  @autobind
  _onClick (e) {
    if (this.props.disabled) return false;

    this.setState({
      hasBeenHit: false // first reset to cancel animation
    }, () => this.setState({
      hasBeenHit: true
    }));

    _.delay(() => {
      if (this._isMounted) this.setState({ hasBeenHit: false })
    }, 320);

    if (this.props.onClick) return this.props.onClick(e);
  }

  componentDidMount () {
    this._isMounted = true;
  }

  componentWillUnmount () {
    this._isMounted = false;
  }

  render () {
    let {
      text,
      size,
      background,
      tooltip,
      icon,
      iconPlacement,
      uppercase,
      loading,
      loadingText,
      className,
      onClick,
      ...restProps
    } = this.props;

    let propClassname = (className || '').split(' ');
    let styleProps = propClassname.map((cn) => style[cn]);
    let btnClass = classNames(
      'btn',
      style.default,
      style[size],
      style[background],
      uppercase ? style.uppercase : '',
      this.state.hasBeenHit ? style.bounceHit : '',
      ...propClassname,
      ...styleProps
    );

    let newProps = {
      ...restProps,
      to: this.props.disabled ? undefined : this.props.to || undefined,
      href: this.props.disabled ? undefined : this.props.href || undefined,
      onClick: this._onClick,
      disabled: (loading || this.props.disabled === true) ? 'disabled' : false,
      className: btnClass
    };

    let displayContents = loading ? loadingText : (text || this.props.children);

    if (this.props.type === 'a') {
      if (restProps.to) {
        return (
          <Link {...newProps}>
            {this.props.loading ?
              <span className={style.loader}></span>
            : null}
            {this.props.icon && !this.props.loading ?
              <i className={classNames('icon', this.props.iconPlacement)}>{String.fromCharCode(this.props.icon)}</i>
              : ''
            }
            {displayContents}
            {this.props.tooltip ?
              <span className={classNames(style.tooltip, 'btn-tooltip')}>{this.props.tooltip}</span>
            : null}
          </Link>
        );
      } else {
        return (
          <a {...newProps}>
            {this.props.loading ?
              <span className={style.loader}></span>
            : null}
            {this.props.icon && !this.props.loading ?
              <i className={classNames('icon', this.props.iconPlacement)}>{String.fromCharCode(this.props.icon)}</i>
              : ''
            }
            {displayContents}
            {this.props.tooltip ?
              <span className={classNames(style.tooltip, 'btn-tooltip')}>{this.props.tooltip}</span>
            : null}
          </a>
        );
      }
    } else if (this.props.type === 'submit') {
      return (
        <button {...newProps}>
          {this.props.loading ?
            <span className={style.loader}></span>
          : null}
          {this.props.icon && !this.props.loading ?
            <i className={classNames('icon', this.props.iconPlacement)}>{String.fromCharCode(this.props.icon)}</i>
            : ''
          }
          {displayContents}
          {this.props.tooltip ?
            <span className={classNames(style.tooltip, 'btn-tooltip')}>{this.props.tooltip}</span>
          : null}
        </button>
      );
    }
  }
}
