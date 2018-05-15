import React, { Component } from 'react';
import { MJMLElement } from 'mjml-core'

import cssVars from '../variables';

@MJMLElement
export default class BaseEmail extends Component {
  render () {
    const style = `
      a {
        color: '#5D7ECB';
        font-weight: 400;
      }
      @media only screen and (max-width:480px) {
        .hideXs {
          display: none;
        }
        .leftAlignXs {
          text-align: left;
          display: block;
        }
      }
    `;

    return (
      <mjml>
        <mj-head>
          <mj-font name='Lato' href='https://fonts.googleapis.com/css?family=Lato:400,400i'/>
          {this.props.title ? <mj-title>{this.props.title}</mj-title> : null}
          <mj-attributes>
            <mj-all font-family='Lato, Helvetica, Arial, sans-serif'/>
            <mj-class name='hideXs' color='red'/>
          </mj-attributes>
        </mj-head>
        <mj-body>
          <mj-container
            background-color='#F1F1F6'
          >
            <mj-raw>
              <style type='text/css'>
                {style}
              </style>
            </mj-raw>
            {this.props.children}
          </mj-container>
        </mj-body>
      </mjml>
    );
  }
}
