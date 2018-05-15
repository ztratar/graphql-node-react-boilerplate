import React, { Component } from 'react';
import cssVars from '../variables';

export default class Heading extends Component {
  render () {
    return (
      <mj-section
        padding='0 0 24px'
        {...this.props}
      >
        <mj-text
          font-size='24px'
          color={cssVars.slateLight}
          font-weight='700'
          line-height='32px'
          align={this.props.align}
        >
          {this.props.children}
        </mj-text>
      </mj-section>
    );
  }
}
