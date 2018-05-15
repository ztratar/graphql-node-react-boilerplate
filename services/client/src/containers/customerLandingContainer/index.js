import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import { Link, withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { autobind } from 'core-decorators';
import ReactScroll from 'react-scroll';

import analytics from 'io/analytics';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import form from 'decorators/form';
import PureComponent from 'components/common/pure';
import Box from 'components/box';
import Logo from 'components/logo';
import VerticalCenter from 'components/verticalCenter';
import ButtonLink from 'components/buttonLink';
import Icon from 'components/icon';
import Img from 'components/img';
import Avatar from 'components/avatar';
import Testimonial from 'components/testimonial';
import ShareBar from 'components/shareBar';
import ShareSidebar from 'components/shareSidebar';
import ScrollDiv from 'components/scrollDiv';
import { Experiment, Variant } from 'components/experiment';
import SignUpModal from 'components/signUpModal';
import Modal from 'components/modal';
import PostCard from 'components/_post/postCard';

import google from '../../assets/images/companyLogos/google.svg';
import accenture from '../../assets/images/companyLogos/accenture.svg';
import amazon from '../../assets/images/companyLogos/amazon.svg';
import amex from '../../assets/images/companyLogos/amex.svg';
import apple from '../../assets/images/companyLogos/apple.svg';
import classpass from '../../assets/images/companyLogos/classpass.svg';

import style from './index.css';

const shareText = 'Check out this app!';

const PRIMARY_FOOTER_LINKS = [{
  text: 'About',
  href: 'https://angel.co/our-company'
}, {
  text: 'Careers',
  href: 'https://angel.co/our-company/jobs'
}, {
  text: 'Terms',
  to: '/terms'
}, {
  text: 'Privacy',
  to: '/privacy'
}];

@form({
  id: 'customer-landing-container',
  initialState: (props) => ({
    showSignupModal: false,
    hasInteractedWithSignupStep1: false,
    hasInteractedWithSignupStep2: false,
    user: {
      utmSource: props.location.query.utm_source || null,
      utmMedium: props.location.query.utm_medium || null,
      utmCampaign: props.location.query.utm_campaign || null,
      utmContent: props.location.query.utm_content || null
    }
  })
})
@graphql(gql`
  query getPosts {
    posts: getTopPosts {
      id
      slug
      title
      summary
      estimatedReadTime
      Image {
        id
        key
      }
    }
  }
`, {
  props: ({
    data: {
      posts,
      loading: postsLoading
    }
  }) => ({
    posts,
    postsLoading
  })
})
@withRouter
@connect(
  (state, props) => ({
    windowWidth: state.app.getIn(['browser', 'window']).width
  })
)
@withStyles(style)
export default class CustomerLandingContainer extends PureComponent {
  constructor (props, context) {
    super(props, context);
  }

  componentDidMount () {
    if (__CLIENT__) {
      const {
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent
      } = this.props.form.get('user').toJSON();

      if (utmSource) {
        analytics.track('LANDING_HAS_UTM_SOURCE', {
          utmSource
        });
      }
      if (utmMedium) {
        analytics.track('LANDING_HAS_UTM_MEDIUM', {
          utmMedium
        })
      }
      if (utmCampaign) {
        analytics.track('LANDING_HAS_UTM_CAMPAIGN', {
          utmCampaign
        })
      }
      if (utmContent) {
        analytics.track('LANDING_HAS_UTM_CONTENT', {
          utmContent
        })
      }
    }
  }

  @autobind
  _onClickTopSignup () {
    analytics.track('CLICKED_SIGNUP_TOP');
    this._openSignupModal();
  }

  @autobind
  _onClickPriceSignup () {
    analytics.track('CLICKED_SIGNUP_PRICE');
    this._openSignupModal();
  }

  @autobind
  _openSignupModal () {
    analytics.track('LANDING_SIGNUP_OPENED');
    this.props.setInForm(['showSignupModal'], true);
  }

  @autobind
  _onClose () {
    analytics.track('LANDING_SIGNUP_CLOSED');
    this.props.setInForm(['showSignupModal'], false);
  }

  @autobind
  _moveDownPage () {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    analytics.track('LANDING_CLICKED_LEARN_MORE');
    ReactScroll.animateScroll.scrollMore(y-100, {
      smooth: true,
      duration: 500
    });
  }

  render () {
    return (
      <div className={style.customerLandingContainer}>
        <SignUpModal
          isOpen={this.props.form.get('showSignupModal')}
          location={this.props.location}
          onClose={this._onClose}
        />
        <ShareSidebar title={shareText}/>
        <div className={style.topSection}>
          <h1 className={style.heroHeading}>Header</h1>
          <p>This explainer text is realy selling you, and now you may want to buy.</p>
          <span className={style.pricingButtonWrapper}>
            <ButtonLink
              className={style.viewPricingButton}
              size='md'
              background='green'
              uppercase={true}
              onClick={this._onClickTopSignup}
            >
              Get started
            </ButtonLink>
          </span>
          <div className={style.benefitsWrapper}>
            <ul className={style.benefits}>
              <li>Benefit #1</li>
              <li>Benefit #2</li>
              <li>Benefit #3</li>
              <li>Benefit #4</li>
              <li>Benefit #5</li>
            </ul>
          </div>
          <div className={style.skyline}></div>
          <Icon src={61701} className={style.downArrow} onClick={this._moveDownPage}/>
        </div>
        <div className={style.socialProof}>
          <h3>Join the companies using us</h3>
          <ul className={style.companies}>
            <li dangerouslySetInnerHTML={{__html: amazon}}></li>
            <li dangerouslySetInnerHTML={{__html: google}}></li>
            <li dangerouslySetInnerHTML={{__html: accenture}}></li>
            <li dangerouslySetInnerHTML={{__html: amex}}></li>
            <li dangerouslySetInnerHTML={{__html: classpass}}></li>
            <li dangerouslySetInnerHTML={{__html: apple}}></li>
          </ul>
        </div>
        <div className={style.testimonials}>
        </div>
        <div className={style.features}>
          <h3>These features will knock your socks off</h3>
          <ul className={style.featureList}>
            <li>
              <Icon src={61911}/>
              <h4>Feature #1 is great</h4>
              <p>
                This is gonna be a huge feature for you.
              </p>
            </li>
            <li>
              <Icon src={61823}/>
              <h4>Feature #2</h4>
              <p>
                Wow, this one is even better than feature #1!
              </p>
            </li>
            <li>
              <Icon src={61875}/>
              <h4>Feature #3</h4>
              <p>
                Another big feature
              </p>
            </li>
            <li>
              <Icon src={61704}/>
              <h4>Feature #4</h4>
              <p>
                The 4th feature is actually just kinda mediocre
              </p>
            </li>
          </ul>
        </div>
        <div className={style.pricingSection}>
          <h2>
            <ReactScroll.Element name='pricing'>
              No-risk pricing
            </ReactScroll.Element>
          </h2>
          <p>
            Our products are well worth the money
          </p>
          <div className={style.prices}>
            <div className={classNames(style.priceCol, style.middlePrice)}>
              <h3>Standard Package</h3>
              <span className={style.price}><strong>$100</strong> / month</span>
              <ul>
                <li>Personal, Dedicated Coach</li>
                <li>Introductory Call</li>
                <li>Custom Strategy & Plan</li>
                <li>Practice Mock Negotiation Call</li>
                <li>Live, Online Chat</li>
                <li>Just-in-time Calls</li>
                <li>Negotiation Training Resources</li>
                <li>Unlimited Email Reviews</li>
                <li>Unlimited Email Writing</li>
                <li>Offer Letter Review</li>
              </ul>
               <ButtonLink
                text='Sign up'
                background='blue'
                onClick={this._onClickPriceSignup}
              />
            </div>
          </div>
        </div>
        <div className={style.faqSection}>
          <div className='container'>
            <h2>Top Questions</h2>
            <ul>
              <li>
                <h4>Question 1?</h4>
                <p>
                  This is an answer.
                </p>
              </li>
              <li>
                <h4>Question 2?</h4>
                <p>
                  This is an answer.
                </p>
              </li>
              <li>
                <h4>Question 3?</h4>
                <p>
                  This is an answer.
                </p>
              </li>
            </ul>
          </div>
        </div>
        {this.props.posts && this.props.posts.length ? <div className={style.learnSection}>
          <div className='container'>
            <div className={style.postWrapper}>
              {this.props.posts && this.props.posts.map((p, i) => (
                <PostCard key={i} post={p} key={p.id}/>
              ))}
              <ButtonLink
                text='Explore recent blog posts'
                size='md'
                className={style.explorePostsButton}
                to='/posts'
              />
            </div>
          </div>
        </div> : null}
        <div className={style.landingFooter}>
          <div className='container'>
            <div className={style.footerTop}>
              <ul className={style.footerPrimaryLinks}>
                {PRIMARY_FOOTER_LINKS.map((link, i) =>
                <li key={i}>
                  {link.to ?
                  <Link to={link.to}>{link.text}</Link>
                  :
                  <a target='_blank' href={link.href}>{link.text}</a>
                  }
                </li>
                )}
              </ul>
              <Logo type='logoIcon' className={style.footerLogo}/>
              <ul className={style.footerSocialLinks}>
                <li>
                  <a href="https://www.facebook.com/ourcompany" target="_blank" className={style.socialFacebook}>Facebook</a>
                </li>
                <li>
                  <a href="https://twitter.com/ourcompany" target="_blank" className={style.socialTwitter}>Twitter</a>
                </li>
              </ul>
            </div>
            <div className={style.footerBottom}>
              <h6>Your Company, Inc</h6>
              <p>
                42 AnswerToUniverse Street<br />
                San Francisco, CA
              </p>
              <p>
                &copy; Your Company, Inc 2017
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
