import React from 'react';
import _ from 'underscore';
import { Link, withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import LandingHeader from 'components/landingHeader';
import Logo from 'components/logo';

import style from './index.css';

@graphql(gql`
  query getMe {
    user: getMyUser {
      id
      signupComplete
    }
  }
`, {
  props: ({
    data: {
      user
    }
  }) => ({ user })
})
@connect(
  (state, props) => ({}),
  (dispatch, props) => ({
    actions: {
      redirectToCustomerSignup: () => dispatch(push('/signup'))
    }
  })
)
@withStyles(style)
@withRouter
export default class LandingMainContainer extends PureComponent {
  render () {
    const user = this.props.user || {
      signupComplete: false
    };
    return (
      <div className={style.landingContainer}>
        <LandingHeader
          pathname={this.props.location.pathname}
          isSignedUp={user.signupComplete}
          lightTheme={this.props.location.pathname.indexOf('/posts/') !== -1 && this.props.location.pathname.indexOf('/topic/') === -1}
        />

        <div className={style.landingContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
