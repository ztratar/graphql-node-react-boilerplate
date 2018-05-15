import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import { Link } from 'react-router';

import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Box from 'components/box';
import PageHeader from 'components/pageHeader';

import style from './index.css';

@withStyles(style)
export default class TermsContainer extends PureComponent {
  render () {
    return (
      <div className={style.termsContainer}>
        <PageHeader
          title='Company Terms of Use'
          text='Updated on November 16th, 2016'
          withTopPadding={true}
          withBottomPadding={true}
        />
        <div className='container'>
          <Box className={style.box}>
            <h2>Overview</h2>

            <p>This web page represents a legal document that serves as our Terms of Use and it governs the legal terms of our website, www.jobstart.com, sub-domains, and any associated web-based and mobile applications (collectively, "Website"), as owned and operated by Company, Inc.</p>
            <p>Capitalized terms, unless otherwise defined, have the meaning specified within the Definitions section below. This Terms of Use, along with our Privacy Policy, any mobile license agreement, and other posted guidelines within our Website, collectively "Legal Terms", constitute the entire and only agreement between you and Company, Inc, and supersede all other agreements, representations, warranties and understandings with respect to our Website and the subject matter contained herein. We may amend our Legal Terms at any time without specific notice to you. The latest copies of our Legal Terms will be posted on our Website, and you should review all Legal Terms prior to using our Website. After any revisions to our Legal Terms are posted, you agree to be bound to any such changes to them. Therefore, it is important for you to periodically review our Legal Terms to make sure you still agree to them.</p>
            <p>By using our Website, you agree to fully comply with and be bound by our Legal Terms. Please review them carefully. If you do not accept our Legal Terms, do not access and use our Website. If you have already accessed our Website and do not accept our Legal Terms, you should immediately discontinue use of our Website.</p>
            <p>The last update to our Terms of Use was posted on 10 August 2014.</p>

            <h2>Definitions</h2>

            <p>The terms "us" or "we" or "our" refers to Company, Inc, the owner of the Website.</p>
            <p>A "Visitor" is someone who merely browses our Website, but has not registered as Member.</p>
            <p>A "Member" is an individual that has registered with us to use our Service.</p>
            <p>Our "Service" represents the collective functionality and features as offered through our Website to our Members.</p>
            <p>A "User" is a collective identifier that refers to either a Visitor or a Member.</p>
            <p>All text, information, graphics, audio, video, and data offered through our Website are collectively known as our "Content".</p>
            <h2>Legal Compliance</h2>
            <p>You agree to comply with all applicable domestic and international laws, statutes, ordinances, and regulations regarding your use of our Website. Company, Inc reserves the right to investigate complaints or reported violations of our Legal Terms and to take any action we deem appropriate, including but not limited to canceling your Member account, reporting any suspected unlawful activity to law enforcement officials, regulators, or other third parties and disclosing any information necessary or appropriate to such persons or entities relating to your profile, email addresses, usage history, posted materials, IP addresses and traffic information, as allowed under our Privacy Policy.</p>
            <h2>Intellectual Property</h2>
            <p>Our Website may contain our service marks or trademarks as well as those of our affiliates or other companies, in the form of words, graphics, and logos. Your use of our Website does not constitute any right or license for you to use such service marks/trademarks, without the prior written permission of the corresponding service mark/trademark owner. Our Website is also protected under international copyright laws. The copying, redistribution, use or publication by you of any portion of our Website is strictly prohibited. Your use of our Website does not grant you ownership rights of any kind in our Website.</p>
            <h2>Links to Other Websites</h2>
            <p>Our Website may contain links to third party websites. These links are provided solely as a convenience to you. By linking to these websites, we do not create or have an affiliation with, or sponsor such third party websites. The inclusion of links within our Website does not constitute any endorsement, guarantee, warranty, or recommendation of such third party websites. Company, Inc has no control over the legal documents and privacy practices of third party websites; as such, you access any such third party websites at your own risk.</p>
            <h2>General Terms</h2>
            <p>Our Legal Terms shall be treated as though it were executed and performed in Delaware, United States and shall be governed by and construed in accordance with the laws of Delaware, United States without regard to conflict of law principles. In addition, you agree to submit to the personal jurisdiction and venue of such courts. Any cause of action by you with respect to our Website, must be instituted within one (1) year after the cause of action arose or be forever waived and barred. Should any part of our Legal Terms be held invalid or unenforceable, that portion shall be construed consistent with applicable law and the remaining portions shall remain in full force and effect. To the extent that any Content in our Website conflicts or is inconsistent with our Legal Terms, our Legal Terms shall take precedence. Our failure to enforce any provision of our Legal Terms shall not be deemed a waiver of such provision nor of the right to enforce such provision. The rights of COMPANY, Inc under our Legal Terms shall survive the termination of our Legal Terms.</p>
          </Box>
        </div>
      </div>
    )
  }
}

