import React from 'react';
import { connect } from 'react-redux';
import hoistStatics from 'hoist-non-react-statics';

import PureComponent from '../../components/common/pure';

export default ({
  is = true,
  otherwise = d => d
}) => WrappedComponent => {
  @connect(
    (state, props) => ({
      identified: !!state.app.getIn(['auth', 'identified'])
    }),
    (dispatch, props) => ({
      actions: {
        otherwise: () => otherwise(dispatch)
      }
    })
  )
  class AuthenticatedDecorator extends PureComponent {
    constructor (props, context) {
      super(props, context);
      this._check(props);
    }
    componentWillUpdate (props) {
      this._check(props);
    }
    _check ({ is, identified, actions}) {
      if (is !== identified) actions.otherwise();
    }
    render () {
      <WrappedComponent {...this.props}/>
    }
  }

  const HoistedComponent = hoistStatics(AuthenticatedDecorator, WrappedComponent);

  HoistedComponent.WrappedComponent = WrappedComponent;

  return HoistedComponent;
};
