import React, { Component, PropTypes } from 'react';

import {
  CLIENT_FQDN
} from '../../../config/environment';

import vars from '../variables';
import BaseEmail from '../components/baseEmail';
import BaseHeader from '../components/baseHeader';
import BaseFooter from '../components/baseFooter';
import Button from '../components/button';
import Heading from '../components/heading';
import Paragraph from '../components/paragraph';
import WellParagraph from '../components/wellParagraph';

export default class CustomerBillingFailed extends Component {
  render () {
    const {
      serviceName,
      redirectToken,
      emailId
    } = this.props;

    return (
      <BaseEmail>
        <BaseHeader text='Billing'/>
        <mj-section padding='0 14px' text-align='center'>
          <mj-section
            background-color='white'
            border-radius='5px'
            padding='48px 32px 38px'
            text-align='center'
          >
            <mj-section padding='12px 0 24px' text-align='center'>
              <mj-text
                font-size='42px'
                color={vars.slateLight}
                font-weight='700'
                align='center'>
                😱
              </mj-text>
            </mj-section>
            <Heading align='center'>
              It looks like your billing information isn't valid.
            </Heading>
            <Paragraph align='center'>
              We attempted to charge your card recently and found their was an issue with your payment information.  Once you update your billing information, {vars.productName} will be able to resume service.
            </Paragraph>
            <Paragraph
              padding='0 0 18px'
              align='center'>
              Please resolve this by following the link below.
            </Paragraph>
            <mj-section padding='12px 0 18px'>
              <Button href={`${CLIENT_FQDN}/billing?token=${redirectToken}&emailId=${emailId}`}>
                Fix billing information
              </Button>
            </mj-section>
          </mj-section>
        </mj-section>
        <BaseFooter/>
      </BaseEmail>
    );
  }
}
