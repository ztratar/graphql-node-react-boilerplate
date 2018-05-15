import React from 'react';
import { mjml2html } from 'mjml';
import ReactDOMServer from 'react-dom/server';

export default (Component, props = {}) => mjml2html(
  ReactDOMServer.renderToStaticMarkup(<Component {...props}/>)
).html;
