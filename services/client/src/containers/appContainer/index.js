import React from 'react';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import userFragment from 'fragments/user';
import AppHeader from 'components/appHeader';
import PureComponent from 'components/common/pure';

import style from './index.css';

const userSubscription = gql`
  subscription MyUserSubscription ($input: UserSubscriptionInput!) {
    user: userSubscription (input: $input) {
      ...UserFragment
    }
  }
  ${userFragment}
`;

@graphql(gql`
  query getMyUser {
    user: getMyUser {
      ...UserFragment
    }
  }
  ${userFragment}
`, {
  props: ({
    data: {
      user,
      loading,
      subscribeToMore
    }
  }) => ({
    user,
    loading,
    subscribeToMyUser: () => subscribeToMore({
      document: userSubscription,
      variables: {
        input: {}
      },
      updateQuery: (previousResult, { subscriptionData }) => {
        if (!subscriptionData.data || !subscriptionData.data.user) {
          return previousResult;
        }

        return Object.assign({}, previousResult, {
          user: subscriptionData.data.user
        })
      },
      onError: (err) => {
        const { captureException } = require('../../io/raven-browser');
        captureException(err);
      }
    })
  })
})
@withStyles(style)
export default class AppContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
    this.unsubscribe = null;
  }
  componentDidMount () {
    if (__CLIENT__) {
      this.unsubscribe = this.props.subscribeToMyUser();
    }
  }
  componentWillUnmount () {
    if (__CLIENT__) {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  }
  render () {
    return (
      <div className={style.appContainer}>
        <AppHeader
          pathname={this.props.location && this.props.location.pathname}
          user={this.props.user}
        />
        <div className={style.contentContainer} id='app-content-container'>
          {this.props.children}
        </div>
      </div>
    );
  }
}
