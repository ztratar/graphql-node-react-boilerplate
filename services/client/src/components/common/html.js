import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import { ASSETS_FQDN, BROWSER_GRAPHQL_FQDN, NODE_ENV, SEGMENT_WRITE_KEY } from '../../../config/environment';

import defaultState from '../../state/redux/default';

const vendorPath = ASSETS_FQDN + '/vendor.js' + (
  __BUILD_STAMP__ ? '?build_stamp=' + __BUILD_STAMP__ : ''
);
const clientPath = ASSETS_FQDN + '/client.js' + (
  __BUILD_STAMP__ ? '?build_stamp=' + __BUILD_STAMP__ : ''
);

export default class Html extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    keywords: PropTypes.string,
    image: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    lang: PropTypes.string,
    twitter: PropTypes.shape({
      card: PropTypes.string,
      site: PropTypes.string,
      creator: PropTypes.string
    }),
    openGraph: PropTypes.shape({
      type: PropTypes.string,
      audio: PropTypes.string,
      video: PropTypes.string,
      locale: PropTypes.string,
      localeAlternates: PropTypes.arrayOf(PropTypes.string),
      siteName: PropTypes.string
    }),
    state: PropTypes.object.isRequired,
    content: PropTypes.string.isRequired,
    style: PropTypes.string.isRequired
  };
  static defaultProps = {
    title: defaultState.app.getIn(['meta', 'title']),
    description: defaultState.app.getIn(['meta', 'description']),
    keywords: [
      'job search',
      'job start',
      'career coach',
      'networking',
      'mock interview',
      'interview practice',
      'code interview',
      'salary negotiation',
      'salary guidance',
      'resume review',
      'job feedback',
      'job hunt',
      'job platform',
      'job network',
      'career guidance',
      'career advice',
      'skill improvement',
      'skills training'
    ].join(', '),
    lang: 'en-us',
    icon: defaultState.app.getIn(['meta', 'icon']),
    image: defaultState.app.getIn(['meta', 'image']),
    twitter: {
      card: 'summary_large_image',
      site: '@gojobstart'
    },
    openGraph: {
      type: 'website',
      locale: 'en_US'
    }
  };
  constructor (props, context) {
    super(props, context);
  }
  _renderHead () {
    return (
      <head>
        {/* Main */}
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
        <meta
          name="keywords"
          content={this.props.keywords}
        />
        <link
          name="icon"
          rel="icon"
          type="image/png"
          href={this.props.icon}
        />


        {/* Open Graph */}
        <meta
          name="og:title"
          property="og:title"
          content={this.props.title}
        />
        <meta
          name="og:description"
          property="og:description"
          content={this.props.description}
        />
        <meta
          name="og:image"
          property="og:image"
          content={this.props.image}
        />
        <meta
          name="og:type"
          property="og:type"
          content={this.props.openGraph.type}
        />
        {this.props.openGraph.audio ? (
        <meta
          name="og:audio"
          property="og:audio"
          content={this.props.openGraph.audio}
        />
        ) : null}
        {this.props.openGraph.video ? (
        <meta
          name="og:video"
          property="og:video"
          content={this.props.openGraph.video}
        />
        ) : null}
        <meta
          name="og:locale"
          property="og:locale"
          content={this.props.openGraph.locale}
        />
        <meta
          name="og:site_name"
          property="og:site_name"
          content={this.props.title}
        />
        <meta
          name="og:url"
          property="og:url"
          content={this.props.url}
        />


        {/* Twitter */}
        <meta
          name="twitter:title"
          property="twitter:title"
          content={this.props.title}
        />
        <meta
          name="twitter:description"
          property="twitter:description"
          content={this.props.description}
        />
        <meta
          name="twitter:image"
          property="twitter:image"
          content={this.props.image}
        />
        {this.props.twitter.card ? (
        <meta
          name="twitter:card"
          property="twitter:card"
          content={this.props.twitter.card}
        />
        ) : null}
        {this.props.twitter.site ? (
        <meta
          name="twitter:site"
          property="twitter:site"
          content={this.props.twitter.site}
        />
        ) : null}
        {this.props.twitter.creator ? (
        <meta
          name="twitter:creator"
          property="twitter:creator"
          content={this.props.twitter.creator}
        />
        ) : null}

        <link rel="dns-prefetch" href={BROWSER_GRAPHQL_FQDN}/>

        {/* Preloads */}
        <style id="css" dangerouslySetInnerHTML={{__html: this.props.style}}/>
      </head>
    );
  }
  render () {
    const ROOT_ID = 'root';
    const js = `
      window.cfg = {
        NODE_ENV: ${JSON.stringify(NODE_ENV)},
        BROWSER_GRAPHQL_FQDN: ${JSON.stringify(BROWSER_GRAPHQL_FQDN)},
        SEGMENT_WRITE_KEY: ${JSON.stringify(SEGMENT_WRITE_KEY)},
        INITIAL_STATE: ${JSON.stringify(this.props.state)},
        ROOT_ID: ${JSON.stringify(ROOT_ID)}
      };
    `;

    return (
      <html
        lang={this.props.lang}>
        {this._renderHead()}
        <body>
          <div id={ROOT_ID} dangerouslySetInnerHTML={{ __html: this.props.content }} />
          <script dangerouslySetInnerHTML={{ __html: js}}></script>
          <script src={vendorPath}></script>
          <script src={clientPath}></script>
        </body>
      </html>
    );
  }
}
