import React, { Component } from 'react';
import vars from '../variables';

export default class BaseFooter extends Component {
  render () {
    return (
      <mj-section padding='42px 14px 24px'>
        <mj-column align='left' padding='0px 0'>
          <mj-text
            font-size='13px'
            font-weight='400'
            line-height='20px'
            align='left'
            padding='0px 0 24px'
            color={vars.slateLight}
          >
            <strong>{vars.companyName}</strong><br/>
            {vars.companyAddress}<br/>
            {vars.companyCity}<br/>
            <a href={vars.companyUrl}>{vars.companyUrl}</a>
          </mj-text>
        </mj-column>
        <mj-column>
          <mj-text
            font-size='13px'
            font-style='italic'
            font-weight='400'
            line-height='20px'
            align='right'
            direction='rtl'
            padding='0px 0px 21px'
            color={vars.slateLighter}
          >
            <span className='leftAlignXs'>
              {vars.companyMission}
            </span>
          </mj-text>
          <mj-section
            padding='0 0'
          >
            <mj-button
              font-size='12px'
              font-family={vars.baseFontFamily}
              background-color='transparent'
              align='right'
              direction='rtl'
              inner-padding='0px 0px'
              outer-padding='0px 0px'
              color={vars.blue}
              href={vars.companyUnsubscribeURL}
            >Unsubscribe</mj-button>
          </mj-section>
        </mj-column>
      </mj-section>
    );
  }
}
