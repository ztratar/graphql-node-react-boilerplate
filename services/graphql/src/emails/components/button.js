import React, { Component } from 'react';
import cssVars from '../variables';

export default class Button extends Component {
  static defaultProps = {
    'background-color': cssVars.blue,
    'font-size': cssVars.textSmall,
    'font-family': cssVars.baseFontFamily,
    'font-weight': '600',
    'color': cssVars.white,
    'text-transform': 'uppercase',
    'inner-padding': '16px 42px',
    'href': '#'
  }

  render () {
    return (
      <mj-button {...this.props}>
        {this.props.children}
      </mj-button>
    );
  }
}
