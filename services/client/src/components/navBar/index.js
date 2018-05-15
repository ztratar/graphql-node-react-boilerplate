import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import classNames from 'classnames';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Icon from 'components/icon';

import style from './index.css';

@connect(
  (state, props) => ({
    location: state.routing.location || state.routing.locationBeforeTransitions
  })
)
@withStyles(style)
export default class NavBar extends PureComponent {
  static propTypes = {
    location: PropTypes.any,
    navs: PropTypes.arrayOf(PropTypes.shape({
      isActive: PropTypes.boolean,
      to: PropTypes.string,
      onClick: PropTypes.func,
      name: PropTypes.string,
      icon: PropTypes.number
    })).isRequired
  };

  static defaultProps = {
    location: {},
    navs: []
  };

  constructor (props, context) {
    super(props, context);
  }
  render () {
    return (
      <div className={classNames(style.navBar, this.props.className)}>
        <ul>
          {this.props.navs.map((n, i) => <li key={i} className={(n.isActive || this.props.location.pathname === n.to) ? style.active : ''}>
            {n.to ? <Link to={n.to}>
              {n.icon ? <Icon src={n.icon}/> : null}
              {n.name}
            </Link> : <a href='#' key={i} onClick={n.onClick}>
              {n.icon ? <Icon src={n.icon}/> : null}
              {n.name}
            </a>}
          </li>)}
        </ul>
      </div>
    );
  }
}
