import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { autobind } from 'core-decorators';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withStyles from 'isomorph-style-loader/lib/withStyles';

import PureComponent from 'components/common/pure';
import Logo from 'components/logo';
import Avatar from 'components/avatar';
import ButtonLink from 'components/buttonLink';
import Icon from 'components/icon';
import userFragment from 'fragments/user';

import { setLoggedOut as logOut } from 'state/redux/actions/app/auth';

import style from './index.css';

@connect(
  (state, props) => {
    return ({
      scrollActive: state.app.getIn(['browser', 'bodyScrollOffset']) > 0,
      currentWidth: state.app.getIn(['browser', 'window']).width
    })
  },
  (dispatch) => ({
    actions: {
      logOut: () => dispatch(logOut())
    }
  })
)
@withStyles(style)
@graphql(gql`
  query appHeaderGetMyUser {
    user: getMyUser {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    data: {
      user,
      loading
    }
  }) => ({
    user,
    loading
  })
})
export default class AppHeader extends PureComponent {
  static defaultProps = {
    user: {}
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      menuOpen: false
    };
  }

  @autobind
  toggleNavbar (retVal, e) {
    if (retVal === false && e && e.preventDefault) {
      e.preventDefault();
    }
    this.setState({ menuOpen: !this.state.menuOpen });
    return retVal;
  }

  _navItems () {
    const { user } = this.props;
    const now = Date.now();

    let items = [{
      icon: 61713,
      text: 'Home',
      link: '/',
      isActive: (path) => path === '/'
    }, {
      icon: 61940,
      text: 'Resources',
      link: '/posts',
      isActive: (path) => ~path.indexOf('/posts')
    }];

    if (this.props.currentWidth < 768) {
      items = items.concat(this._secondaryNavItems());
    }

    return _.compact(items);
  }

  _secondaryNavItems () {
    let items = [];

    if (this.props.currentWidth < 992) {
      items = items.concat({
        icon: 61844,
        text: 'Profile',
        link: '/me',
        isActive: (path) => ~path.indexOf('/me')
      });
    }

    if (this.props.user && this.props.user.isAdmin) {
      items.push({
        text: 'Admin',
        link: '/admin'
      });

      items.push({
        icon: 61782,
        text: 'Coach Dashboard',
        link: '/coach_dashboard',
        isActive: (path) => (path.indexOf('/coach_dashboard') !== -1)
      });
    }

    items.push({
      text: 'Log out',
      onClick: function (e) {
        e.preventDefault();
        this.props.actions.logOut();
        window.location.reload(true);
      }
    });

    return items;
  }

  render () {
    if (this.props.loading) return <div></div>;

    const { user = {} } = this.props;

    const userPaid = user.selectedPlan && user.hasConnectedBilling;

    return (
      <div className={classNames(style.appHeader, this.props.scrollActive ? style.scrollActive : '')}>
        <Link to='/'>
          <Logo className={style.logo}/>
        </Link>
        {userPaid ? <div className={classNames(style.navBar, (this.state.menuOpen && this.props.currentWidth < 768) ? style.openNavBar : '')}>
          <ul className={style.navigationItems}>
            {this._navItems().map((item, key) =>
              <li key={key}>
                <Link
                  to={item.link}
                  className={classNames(style.normalItem, (item.isActive && item.isActive(this.props.pathname)) ? style.activeItem : '')}
                  onClick={item.onClick ? item.onClick.bind(this) : this.props.currentWidth < 768 ? this.toggleNavbar.bind(this, true) : () => {}}
                >
                  {item.icon && item.icon !== 'avatar' ? <Icon src={item.icon}/> : null}
                  {item.icon === 'avatar' ? <Avatar src={this.props.user.Avatar ? this.props.user.Avatar.key : ''} className={style.avatar}/> : null}
                  {item.text}
                </Link>
              </li>
            )}
          </ul>
        </div> : null}
        {userPaid ? <Link
          to='/me'
          className={classNames(
            style.profileItem,
            style.normalItem,
            this.props.pathname === '/me' ? style.activeItem : ''
          )}
        >
          <div className='media'>
            <Avatar src={this.props.user.Avatar ? this.props.user.Avatar.key : ''} className={style.avatar}/>
            <div className='media-body'>
              <h5>{this.props.user.name.split(' ')[0]}</h5>
            </div>
          </div>
        </Link> : null}
        <a href='#' className={style.menuIcon} onClick={this.toggleNavbar.bind(this, false)}>
          {this.props.currentWidth < 768 ? <Icon src='hamburger'/> : <Icon src={61701}/>}
        </a>
        <div className={classNames(style.secondaryNav, this.props.currentWidth >= 768 && this.state.menuOpen ? style.openSecondaryNav : '')}>
          <ul className={style.secondaryNavItems}>
            {this._secondaryNavItems().map((item, key) =>
              <li key={key}>
                <Link
                  to={item.link}
                  onClick={item.onClick ? item.onClick.bind(this) : this.toggleNavbar}
                >
                  {item.text}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  }
}
