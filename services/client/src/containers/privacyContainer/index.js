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
export default class PrivacyContainer extends PureComponent {
  render () {
    return (
      <div className={style.privacyContainer}>
        <PageHeader
          title='Jobstart Privacy Policy'
          text='Updated on November 16th, 2016'
          withTopPadding={true}
          withBottomPadding={true}
        />
        <div className='container'>
          <Box className={style.box}>
            <h2>We collect personal and activity data, which may be linked.</h2>
            <p>We use technologies like cookies (small files stored on your browser), web beacons, or unique device identifiers to identify your computer or device so we can deliver a better experience. Our systems also log information like your browser, operating system and IP address.</p>
            <p>We also may collect personally identifiable information that you provide to us, such as your name, address, phone number or email address. With your permission, we may also access other personal information on your device, such as your phone book, calendar or messages, in order to provide services to you. If authorized by you, we may also access profile and other information from services like Facebook.</p>
            <p>Our systems may associate this personal information with your activities in the course of providing service to you (such as pages you view or things you click on or search for).</p>
            <p>We do not knowingly contact or collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us so we can promptly obtain parental consent or remove the information.</p>
            <p>Our service does not currently recognize the "Do Not Track" signal that may be available in some web browsers. </p>
            <h2>We collect or share your location only with permission.</h2>
            <p>In serving you, we may use or store your precise geographic location, if you give us permission to do so. We do not use or share this data for any other purpose. Many devices will indicate through an icon when location services are operating. We only share this location information with others as approved by you. </p>
            <h2>You can request to see your personal data.</h2>
            <p>You can sign into your account to see any personally identifiable information we have stored, such as your name, email, address or phone number. You can also contact us by email to request to see this information. </p>
            <h2>We keep personal data until you delete it.</h2>
            <p>We remove personally identifiable information (such as your name, address, email or phone number) and other preferences associated with your account promptly after you delete your account. We may retain other data indefinitely. </p>
            <h2>We share your personal data with other companies.</h2>
            <p>We generally do share personally identifiable information (such as name, email or phone) with other companies.</p>
            <h2>No ad companies collect data through our service.</h2>
            <p>We do not allow advertising companies to collect data through our service for ad targeting.</p>
            <h2>You can ask privacy questions.</h2>
            <p>If you have any questions or concerns about our privacy policies, please contact us:</p>
            <p><a href="mailto: support@jobstart.com">support@jobstart.com</a></p>
            <h2>Analytics providers access data on our behalf.</h2>
            <p>Analytics companies may access anonymous data (such as your IP address or device ID) to help us understand how our services are used. They use this data solely on our behalf. They do not share it except in aggregate form; no data is shared as to any individual user. Click to see company privacy policies that govern their use of data. </p>
            <h2>We take detailed steps to protect personal information.</h2>
            <p>We take reasonable administrative, physical and electronic measures designed to safeguard and protect your information from unauthorized access or disclosure. This includes utilizing Secure Sockets Layer (SSL) software, which encrypts the personal information you input, and storing your information in encrypted form behind a firewall designed to block access from outside our network. However, no security or encryption method can be guaranteed to protect information from hackers or human error.</p>
            <p>Information we collect may be stored or processed on computers located in any country where we do business. </p>
            <h2>Special situations may require disclosure of your data.</h2>
            <p>To operate the service, we also may make identifiable and anonymous information available to third parties in these limited circumstances: (1) with your express consent, (2) when we have a good faith belief it is required by law, (3) when we have a good faith belief it is necessary to protect our rights or property, or (4) to any successor or purchaser in a merger, acquisition, liquidation, dissolution or sale of assets. Your consent will not be required for disclosure in these cases, but we will attempt to notify you, to the extent permitted by law to do so. </p>
            <h2>You can review more privacy-related information.</h2>
            <p>This privacy policy was last updated on November 16th, 2016. Our privacy policy may change from time to time. If we make any material changes to our policies, we will place a prominent notice on our website or application. If the change materially affects registered users, we will send a notice to you by email, push notification or text.</p>
          </Box>
        </div>
      </div>
    )
  }
}

