import React from 'react';
import { connect } from 'react-redux';
import { isFunction } from 'underscore';
import Immutable from 'immutable';
import { withApollo } from 'react-apollo';
import { autobind } from 'core-decorators';
import hoistStatics from 'hoist-non-react-statics';

import PureComponent from '../components/common/pure';

export default (name, query, options = {}) => WrappedComponent => {

  @withApollo
  class GraphQLDeferredDecorator extends PureComponent {
    constructor (props, context) {
      super(props, context)
    }
    @autobind
    _query (variables = {}) {
      return this.props.client.query({
        ...options,
        variables,
        query
      });
    }
    render () {
      const props = {
        ...this.props,
        [name]: this._query
      }
      return <WrappedComponent {...props} />;
    }
  }

  const HoistedComponent = hoistStatics(GraphQLDeferredDecorator, WrappedComponent);

  HoistedComponent.WrappedComponent = WrappedComponent;

  return HoistedComponent;
};
