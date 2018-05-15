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

export default class ResetPassword extends Component {
  static propTypes = {
    redirectToken: PropTypes.string.isRequired
  };

  render () {
    return (
      <BaseEmail>
        <BaseHeader text='Reset Password'/>
        <mj-section padding='0 14px' text-align='center'>
          <mj-section
            background-color='white'
            border-radius='5px'
            padding='48px 32px 38px'
            text-align='center'
          >
            <Heading align='center'>
              Click the link below to reset your password.
            </Heading>
            <Paragraph
              padding='0 0 18px'
              align='center'
            >
              Didn't request a password reset? Contact support at {vars.companySupportEmail}.
            </Paragraph>
            <mj-section padding='12px 0 18px'>
              <Button href={`${CLIENT_FQDN}/reset_password?reset_token=${this.props.redirectToken}`}>
                Reset your password
              </Button>
            </mj-section>
          </mj-section>
        </mj-section>
        <BaseFooter/>
      </BaseEmail>
    );
  }
}
