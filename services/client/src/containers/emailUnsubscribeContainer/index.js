import React from 'react';
import classNames from 'classnames';

import _ from 'underscore';
import { Link } from 'react-router';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import ButtonLink from 'components/buttonLink';
import Loader from 'components/loader';
import Logo from 'components/logo';
import VerticalCenter from 'components/verticalCenter';
import BottomLinks from 'components/bottomLinks';
import { Form, Radio } from 'components/form';

import style from './index.css';

const BOTTOM_LINKS = [{
  displayText: 'Home',
  href: '/'
}, {
  displayText: 'Log In',
  href: '/login'
}];

const FEEDBACK_OPTIONS = [{
  displayText: 'You send too many emails',
  value: 'too_many_emails'
}, {
  displayText: 'Didn\'t find value in Jobstart',
  value: 'no_value_jobstart'
}, {
  displayText: 'Don\'t need Jobstart anymore',
  value: 'no_value_anymore'
}, {
  displayText: 'It wasn\'t you, it was me',
  value: 'was_me'
}];

@withStyles(style)
export default class EmailUnsubscribeContainer extends PureComponent {
  render () {
    const loading = false;
    const feedbackGiven = true;

    return (
      <div className={style.emailUnsubscribeContainer}>
        <VerticalCenter>
          <Link to='/' >
            <Logo/>
          </Link>
          <div className={style.box}>
            {loading ?
              <div className={style.loaderWrap}>
                <Loader/>
              </div>
            : null}
            {!loading && !feedbackGiven ?
              <div>
                <h1>Why'd you go?</h1>
                <Form>
                  {FEEDBACK_OPTIONS.map((f, i) =>
                    <Radio key={i} text={f.displayText} name='reaso' value={f.value}/>
                  )}
                </Form>
              </div>
            : null }
            {!loading && feedbackGiven ?
              <div>
                <h1>You've been unsubscribed.</h1>
                <p>
                  Thank you for the feedback
                </p>
              </div>
            : null }
          </div>
          <BottomLinks items={BOTTOM_LINKS}/>
        </VerticalCenter>
      </div>
    );
  }
}
