import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import { autobind } from 'core-decorators';
import ReactScroll from 'react-scroll';

import analytics from 'io/analytics';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Logo from 'components/logo';
import Icon from 'components/icon';
import ButtonLink from 'components/buttonLink';

import style from './index.css';

@connect(
  (state, props) => ({
    windowWidth: state.app.getIn(['browser','window']).width,
    scrollActive: state.app.getIn(['browser', 'bodyScrollOffset']) > 40,
    bodyScrollOffset: state.app.getIn(['browser', 'bodyScrollOffset'])
  })
)
@withRouter
@withStyles(style)
export default class LandingHeader extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isSignedUp: PropTypes.bool.isRequired,
    lightTheme: PropTypes.bool
  };

  static defaultProps = {
    pathname: '/',
    isSignedUp: false,
    lightTheme: false
  };

  constructor (props, context) {
    super(props, context);

    this.state = {
      menuShown: false
    };
  }

  _getNavItems () {
    let items = [{
      displayIf: (aTab) => aTab !== '/',
      display: 'Home',
      to: '/'
    }, {
      displayIf: () => true,
      display: 'Log In',
      to: '/login',
      className: style.logInButton
    }];

    if (this.props.windowWidth < 480) {
      items = [{
        displayIf: (aTab) => aTab !== '/',
        display: 'Home',
        to: '/'
      }, {
        display: 'Learn',
        to: '/posts',
        displayIf: () => true
      }, {
        displayIf: () => true,
        display: 'Log In',
        to: '/login',
        className: style.logInButton
      }];
    }

    return items;
  }

  @autobind
  _clickMenuButton (e) {
    e.preventDefault();

    this.setState({
      menuShown: !this.state.menuShown
    });

    return false;
  }

  @autobind
  _clickedNav (e) {
    this.setState({
      menuShown: false
    });
  }

  render () {
    const showFreeTrialButton = (
      this.props.windowWidth > 1200 ? (
        this.props.bodyScrollOffset > 360 && this.props.bodyScrollOffset < 2113
      ) : (
        this.props.bodyScrollOffset > 380 && this.props.bodyScrollOffset < 2600
      )
    );

    let showPhone = false;

    if (this.props.pathname === '/') {
      showPhone = true;
    }

    return (
      <div className={classNames(
        style.landingHeader,
        this.props.scrollActive ? style.scrollActive : '',
        this.props.lightTheme && !this.props.scrollActive ? style.lightLandingHeader : ''
      )}>
        <div className="container">
          <div className="navbar-header">
            <button type="button" onClick={this._clickMenuButton} className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link to='/'>
              <Logo lightTheme={this.props.lightTheme && !this.props.scrollActive}/>
            </Link>
          </div>
          { this.props.pathname === '/' ? <ReactScroll.Link
            className={classNames(style.startFreeTrialButton, showFreeTrialButton ? style.startFreeTrialButtonShown : '')}
            to='pricing'
            smooth={true}
            duration={600}
            offset={-120}
            onClick={() => analytics.track('BOOST_LANDING_HEADER_CLICKED_START_FREE_TRIAL')}>
              View Pricing
          </ReactScroll.Link> : null}
          { showPhone ? <div className={style.phoneNumber}>
            <Icon src={61911}/>
            (123) 456-7890
          </div> : null }
          <div className={classNames(!this.state.menuShown ? 'collapse' : '', 'navbar-collapse')} id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              {this._getNavItems().map((nav, i) => (!nav.displayIf(this.props.pathname)) ? '' :
                <li key={i} className={nav.to === this.props.pathname ? 'active' : ''}>
                  {nav.to ?
                  <Link
                    to={nav.to}
                    onClick={this._clickedNav}
                    className={nav.className}
                  >
                    {nav.display}
                  </Link>
                  :<a href={nav.href} onClick={this._clickedNav}>{nav.display}</a>}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
