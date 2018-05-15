import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isFunction } from 'underscore';
import Immutable from 'immutable';
import { autobind } from 'core-decorators';
import hoistStatics from 'hoist-non-react-statics';

import { create, update, set, destroy } from '../state/redux/actions/app/form';
import PureComponent from '../components/common/pure';

const { shape, func, object } = PropTypes;

let cacheTTLHash = {};

export default ({
  id = null,
  updateProp = 'updateForm',
  setInProp = 'setInForm',
  formProp = 'form',
  initialState = {}
}) => WrappedComponent => {

  class FormDecorator extends PureComponent {
    constructor (props, context) {
      super(props, context);
      this.__name = id || props.name;
      this.initialStateSet = false;
      this._willUnmount = false;
      this._cacheTTL = props.cacheTTL || 0;
    }
    @autobind
    _getInitialState () {
      return isFunction(initialState) ? initialState(this.props) : initialState;
    }
    _setInitialState () {
      if (!this.initialStateSet && this.props[formProp]) {
        this.initialStateSet = true;
        return;
      }
      if (this.initialStateSet) return;

      this.context.store.dispatch(create({key: this.__name, value: this._getInitialState()}));

      this.initialStateSet = true;
    }
    componentWillMount () {
      this._setInitialState();

      if (cacheTTLHash[this.__name]) clearTimeout(cacheTTLHash[this.__name]);
    }
    componentWillUnmount () {
      if (this._cacheTTL) {
        cacheTTLHash[this.__name] = setTimeout(() => {
          this._willUnmount = true;
          this.initialStateSet = false;
          this.context.store.dispatch(destroy({key: this.__name}));
        }, this._cacheTTL);
      } else {
        this._willUnmount = true;
        this.initialStateSet = false;
        this.context.store.dispatch(destroy({key: this.__name}));
      }
    }
    render () {
      const setInForm = (path, value) => {
        if (this._willUnmount) return;
        this._setInitialState();
        this.props[setInProp](path, value);
      };

      const updateForm = (data = {}) => {
        if (this._willUnmount) return;
        this._setInitialState();
        this.props[updateProp](data);
      };

      const props = {
        ...this.props,
        [formProp]: this.props[formProp] || Immutable.fromJS(this._getInitialState()),
        [setInProp]: setInForm,
        [updateProp]: updateForm,
        _getInitialState: this._getInitialState
      };
      return <WrappedComponent {...props} />;
    }
  }

  const HoistedComponent = hoistStatics(FormDecorator, WrappedComponent);

  HoistedComponent.WrappedComponent = WrappedComponent;

  HoistedComponent.contextTypes = {
    ...(WrappedComponent.contextTypes || {}),
    store: shape({
      dispatch: func.isRequired
    })
  };

  return connect((state, props) => ({
    [formProp]: state.app.getIn(['form', id || props.name])
  }),
  (dispatch, props) => ({
    [updateProp]: (value) => dispatch(update({key: id || props.name, value})),
    [setInProp]: (path, value) => dispatch(set({key: id || props.name, path, value}))
  }))(HoistedComponent);
};
