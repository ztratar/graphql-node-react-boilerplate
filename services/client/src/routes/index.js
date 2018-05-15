import React from 'react';
import { Router, Route, IndexRoute, Redirect } from 'react-router';
import debug from 'debug';

import RenderContext from '../lib/isomorphic/renderContext';

import LandingMainContainer from '../containers/landingMainContainer';
import CustomerLandingContainer from '../containers/customerLandingContainer';
import TermsContainer from '../containers/termsContainer';
import PrivacyContainer from '../containers/privacyContainer';

import CustomerProfileContainer from '../containers/customerProfileContainer';
import CustomerHomeContainer from '../containers/customerHomeContainer';
import BillingContainer from '../containers/billingContainer';
import PostContainer from '../containers/postContainer';
import PostsContainer from '../containers/postsContainer';
import TopicPostsContainer from '../containers/topicPostsContainer';

import LogInContainer from '../containers/logInContainer';
import ForgotPasswordContainer from '../containers/forgotPasswordContainer';
import ResetPasswordContainer from '../containers/resetPasswordContainer'
import EmailUnsubscribeContainer from '../containers/emailUnsubscribeContainer';

import AdminContainer from '../containers/adminContainer';

import AppContainer from '../containers/appContainer';
import AdminPostsContainer from '../containers/adminPostsContainer';

import getApp from '../components/common/app';

const log = debug('client:routes');

export default function routesFactory (store, user) {

  const renderContext = new RenderContext();

  const App = getApp(renderContext);

  const { app } = store.getState();

  const appAccess = !!app.getIn(['auth', 'appAccess']);

  let adminOnly = false;

  if (appAccess) {
    log('using has-access route set');
    if (user && user.isAdmin) {
      log('adding admin-only route set');
      adminOnly = true;
    }
  } else {
    log('using has-no-access route set');
  }

  let routes = (
    <Route component={App}>
      <Route path='/login' component={LogInContainer}/>
      <Route path='/forgot_password' component={ForgotPasswordContainer}/>
      <Route path='/reset_password' component={ResetPasswordContainer}/>
      <Route path='/email_unsubscribe' component={EmailUnsubscribeContainer}/>

      {!appAccess ? (
        <Route path='' component={LandingMainContainer}>
          <Route path='/terms' component={TermsContainer}/>
          <Route path='/privacy' component={PrivacyContainer}/>
          <Route path='/' component={CustomerLandingContainer}/>
          <Route path='/posts' component={PostsContainer}/>
          <Route path='/posts/topic/:topicSlug' component={TopicPostsContainer}/>
          <Redirect from='/guides/:postSlug' to='/posts/:postSlug'/>
          <Route path='/posts/:postSlug' component={PostContainer}/>
          <Route path='/blog/:postSlug' component={PostContainer}/>
        </Route>
      ) : (
        <Route path='' component={AppContainer}>
          <Route path='/' component={CustomerHomeContainer}/> : null }
          <Route path='/me' component={CustomerProfileContainer}/> : null }
          <Route path='/me/:meTab' component={CustomerProfileContainer}/>
          <Route path='/billing' component={BillingContainer}/>
          <Route path='/posts/topic/:topicSlug' component={TopicPostsContainer}/>
          <Route path='/posts' component={PostsContainer}/>
          <Redirect from='/guides/:postSlug' to='/posts/:postSlug'/>
          <Route path='/posts/:postSlug' component={PostContainer}/>
          <Route path='/blog/:postSlug' component={PostContainer}/>

          { adminOnly ? <Route path='/admin' component={AdminContainer}>
            <IndexRoute component={AdminPostsContainer}/>
            <Route path='/admin/posts' component={AdminPostsContainer}/>
          </Route> : null }
        </Route>
      )}
      <Redirect from='*' to='/'/>
    </Route>
  );

  return {
    renderContext,
    routes
  };
}
