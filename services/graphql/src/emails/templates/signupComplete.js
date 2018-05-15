import React, { Component } from 'react';

import vars from '../variables';
import BaseEmail from '../components/baseEmail';
import BaseHeader from '../components/baseHeader';
import BaseFooter from '../components/baseFooter';
import Button from '../components/button';
import Heading from '../components/heading';
import Paragraph from '../components/paragraph';

import {
  CLIENT_FQDN
} from '../../../config/environment';

export default class CustomerSignupComplete extends Component {
  getSubject (props) {
    return `Welcome to ${vars.productName}, ${this.props.name}!`;
  }
  render () {
    return (
      <BaseEmail>
        <BaseHeader text=''/>
        <mj-section padding='0 14px'>
          <mj-section
            background-color='white'
            border-radius='5px'
            padding='48px 32px 54px'
          >
            <mj-section padding='12px 0 24px' align='center'>
              <mj-text
                font-size='42px'
                color={vars.slateLight}
                font-weight='700'
                align='center'
              >
                🙂
              </mj-text>
            </mj-section>
            <Heading align='center'>
              Thanks for signing up for {vars.productName}!
            </Heading>
            <Paragraph align='center'>
              You now have accessd to your dashboard.
            </Paragraph>
            <Paragraph padding='0 0 42px' align='center'>
              Visit the site anytime to continue.
            </Paragraph>
            <Button href={CLIENT_FQDN}>
              Go to {vars.productName}
            </Button>
          </mj-section>
        </mj-section>
        <BaseFooter/>
      </BaseEmail>
    );
  }
}
