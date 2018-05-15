import React, { Component } from 'react';
import cssVars from '../variables';

import Paragraph from './paragraph';

export default class WellParagraph extends Component {
  render () {
    return (
      <mj-section margin='0' padding='0'>
        <mj-column padding='0' width='540'>
          <Paragraph
            background-color='#f4f4f4'
            width='100%'
            border-radius='5px'
            padding='24px'
            font-size='16px'
            color={cssVars.slateLight}
            font-style='italic'
          >
            {this.props.children}
          </Paragraph>
        </mj-column>
      </mj-section>
    );
  }
}
