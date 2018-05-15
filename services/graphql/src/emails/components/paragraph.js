import React, { Component } from 'react';
import cssVars from '../variables';

export default class Paragraph extends Component {
  render () {
    return (
      <mj-section
        padding={this.props.padding || '0 0 14px'}
        {...this.props}
      >
        <mj-text
          font-size='16px'
          font-style='italic'
          color={cssVars.slateLight}
          line-height='24px'
          align={this.props.align}
        >
          {this.props.children}
        </mj-text>
      </mj-section>
    );
  }
}
