import React from 'react';
import _ from 'underscore';
import { autobind } from 'core-decorators';
import PureComponent from 'components/common/pure';

export default class Img extends PureComponent {
  static propTypes = {
    defaultSrc: React.PropTypes.string,
    onError: React.PropTypes.func
  };

  constructor (props, context) {
    super(props, context);
  }

  componentDidMount () {
    if (__CLIENT__) {
      const { img } = this.refs;
      if (img && !img.complete) return;
      if (img && img.naturalWidth === 0) this._onError();
    }
  }

  @autobind
  _onError (e) {
    const { defaultSrc } = this.props;
    const { img } = this.refs;

    if (defaultSrc && defaultSrc !== img.src) img.src = defaultSrc;

    if (e && _.isFunction(this.props.onError)) this.props.onError(e);
  }

  render () {
    const src = this.props.src || this.props.defaultSrc;

    return (
      <img
        {..._.omit(this.props, 'defaultSrc')}
        src={src}
        onError={this._onError}
        ref='img'
      />
    )
  }
}
