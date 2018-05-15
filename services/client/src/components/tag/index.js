import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from 'components/common/pure';
import Icon from 'components/icon';

import style from './index.css';

@withStyles(style)
export default class Tag extends PureComponent {
  static propTypes = {
    text: React.PropTypes.string.isRequired,
    to: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    background: React.PropTypes.oneOf([
      'blue',
      'green',
      'red',
      'orange',
      'light',
      'dark'
    ]),
    size: React.PropTypes.oneOf([
      'sm',
      'md',
      'lg',
      'vlg'
    ]),
    className: React.PropTypes.string
  };
  static defaultProps = {
    text: '',
    background: 'blue',
    size: 'md',
    className: ''
  };

  constructor (props, context) {
    super(props, context);
  }

  render () {
    return (
      <div className={classNames(style.tag, style[`background-${this.props.background}`], style[`size-${this.props.size}`], this.props.className)}>
        {this.props.to ?
          <Link to={this.props.to}>{this.props.text}</Link>
        :
          <span>{this.props.text}</span>
        }
        {this.props.onCancel ?
          <a href='#' onClick={this.props.onCancel} className={classNames(style.cancel, style[`cancel-${this.props.size}`])}>
            <Icon src={61943}/>
          </a>
        : null}
      </div>
    );
  }
}
