import React, { Component } from 'react';

import vars from '../variables';

export default class BaseHeader extends Component {
  render () {
    return (
      <mj-section padding='42px 14px 24px'>
        <mj-column>
          <mj-image
            href={vars.companyUrl}
            align='left'
            width={vars.companyLogoWidth}
            padding='0px'
            src={vars.companyLogoUrl}
          />
        </mj-column>
        <mj-column>
          <mj-text
            align='right'
            padding='10px 0 0'
            font-size='14px'
            color='#9EA2B3'
            text-transform='uppercase'
          >
            <span className='hideXs'>
              {this.props.text}
            </span>
          </mj-text>
        </mj-column>
      </mj-section>
    );
  }
}
