import React from 'react';
import classNames from 'classnames';

import PureComponent from 'components/common/pure';

import logo from '../../assets/images/logo.svg';
import favicon from '../../assets/images/favicon.png';

export default class StatusPageContainer extends PureComponent {
  static defaultProps = {
    title: 'Jobstart | Salary Negotiation Coaching',
    description: 'Make smarter professional decisions with the smartest 1-on-1 advisor in your industry',
    lang: 'en-us',
    icon: favicon
  };
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return (
      <html
        lang={this.props.lang}>
        <head>
          <meta charSet="utf-8" />
          <meta
            httpEquiv="content-type"
            content="text/html; charset=utf-8"
          />
          <meta
            httpEquiv="x-ua-compatible"
            content="ie=edge"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <title>{this.props.title}</title>
          <meta
            name="description"
            content={this.props.description}
          />
          <link
            name="icon"
            rel="icon"
            type="image/png"
            href={this.props.icon}
          />
          <style dangerouslySetInnerHTML={{__html: `
            @font-face {
              font-family: 'Lato';
              font-style: normal;
              font-weight: 400;
              src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/8qcEw_nrk_5HEcCpYdJu8BTbgVql8nDJpwnrE27mub0.woff2) format('woff2');
              unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20CF, U+2C60-2C7F, U+A720-A7FF;
            }
            /* latin */
            @font-face {
              font-family: 'Lato';
              font-style: normal;
              font-weight: 400;
              src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/MDadn8DQ_3oT6kvnUq_2r_esZW2xOQ-xsNqO47m55DA.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;
            }
            /* latin-ext */
            @font-face {
              font-family: 'Lato';
              font-style: italic;
              font-weight: 400;
              src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/cT2GN3KRBUX69GVJ2b2hxn-_kf6ByYO6CLYdB4HQE-Y.woff2) format('woff2');
              unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20CF, U+2C60-2C7F, U+A720-A7FF;
            }
            /* latin */
            @font-face {
              font-family: 'Lato';
              font-style: italic;
              font-weight: 400;
              src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/1KWMyx7m-L0fkQGwYhWwuuvvDin1pK8aKteLpeZ5c0A.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;
            }

            .status-page {
              font-family: 'Lato', Arial, sans-serif;
              text-align: center;
              background: #4a5d6f;
              width: 100%;
              height: 100%;
              position: fixed;
              top: 0;
              left: 0;
              overflow-y: scroll;
            }

            .status-page h1 {
              font-size: 22px;
              line-height: 32px;
              font-weight: bold;
              margin: 32px auto 32px;
              max-width: 380px;
              color: #4B4B55;
            }

            .status-page p {
              margin: 0 auto 14px;
              max-width: 380px;
              font-size: 16px;
              font-style: italic;
              color: #4B4B55;
            }

            svg path {
              fill: #6183D0;
            }

            .vertical-center {
              display: table;
              height: 100%;
              width: 100%;
            }

            .vertical-center-content {
              display: table-cell;
              vertical-align: middle;
            }

            .box {
              background: white;
              box-shadow: 0px 2px 21px 0px rgba(0,0,0,0.03), 0px 1px 4px 0px rgba(0,0,0,0.06);
              border-radius: 5px;
              margin: 0 auto;
              max-width: 440px;
              padding: 42px 32px 32px;
            }
          `}}/>
        </head>
        <body>
          <div className='status-page'>
            <div className='vertical-center'>
              <div className='vertical-center-content'>
                <div className='box'>
                  <div className='logo' dangerouslySetInnerHTML={{__html: logo}}/>
                  <h1>
                    We are currently experiencing technical difficulties.
                  </h1>
                  <p>
                    We are currently working on the issue and will bring the site back up as quickly as possible.
                  </p>
                  <p>
                    Sorry about the inconvenience. We'll be back soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }
}
