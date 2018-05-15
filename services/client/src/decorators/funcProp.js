import React from 'react';
import { isFunction, isString } from 'underscore';
import hoistStatics from 'hoist-non-react-statics';

import PureComponent from '../components/common/pure';

export default (propName, fn) => WrappedComponent => {

  if (!isString(propName)) throw new Error('funcProp requires string (propName) passed as first parameter in outer invocation');

  if (!isFunction(fn)) throw new Error('funcProp requires function (fn) passed as second parameter in outer invocation');

  class FuncPropDecorator extends PureComponent {
    constructor (props, context) {
      super(props, context);
    }
    render () {
      const props = {
        ...this.props,
        [propName]: fn
      };
      return <WrappedComponent {...props} />;
    }
  }

  const HoistedComponent = hoistStatics(FuncPropDecorator, WrappedComponent);

  HoistedComponent.WrappedComponent = WrappedComponent;

  return HoistedComponent;
};
