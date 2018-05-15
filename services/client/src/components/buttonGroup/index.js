import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import { Link } from 'react-router';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import ButtonLink from 'components/buttonLink';

import style from './index.css';

@withStyles(style)
export default class ButtonGroup extends PureComponent {
  static propTypes = {
    text: React.PropTypes.string,
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
      'grey',
      'dark',
      'blue',
      'orange',
      'green',
      'red'
    ]),
    icon: React.PropTypes.any,
    iconPlacement: React.PropTypes.oneOf(['left', 'right']),
    className: React.PropTypes.string,
    alignment: React.PropTypes.string,
  };

  static defaultProps = {
    size: 'md',
    icon: '',
    iconPlacement: 'left',
    background: 'blue',
    className: '',
    alignment: 'left'
  }

  constructor (props, context) {
    super(props, context);

    this.state = {
      dropdownOpen: false
    };
  }

  @autobind
  _onButtonClick (e) {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  @autobind
  _collapse (e) {
    setTimeout(() => this.setState({
      dropdownOpen: false
    }), 220);
  }

  render () {
    const {
      options,
      alignment,
      ...rest
    } = this.props;

    return (
      <div
        className={classNames(style.buttonGroup, 'btn-group', this.state.dropdownOpen ? 'open ' + style.isOpen : '', this.props.alignment === 'right' ? style.rightAligned : '')}
        tabIndex='0'
        onBlur={this._collapse}
      >
        <ButtonLink
          {...rest}
          className={this.props.className}
          onClick={this._onButtonClick}
        />
        <ul className='dropdown-menu'>
          {this.props.options.map((o, k) => <li key={k}>
            {o.to ? (
              <Link to={o.to}>{o.text}</Link>
            ) : (
              <a href={o.href || '#'} onClick={o.onClick}>{o.text}</a>
            )}
          </li>)}
        </ul>
      </div>
    );
  }
}
