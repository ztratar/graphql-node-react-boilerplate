import React from 'react';
import classNames from 'classnames';

import PureComponent from 'components/common/pure';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import style from './index.css';

@withStyles(style)
export default class FlashBanner extends PureComponent {
  constructor (props, context) {
    super(props, context);

    this.state = {
      message: null
    };
  }
  componentWillReceiveProps (nextProps) {
    if (__CLIENT__) {
      this.setState({
        message: nextProps.message
      });
      if (this.props.onTimeout) {
        setTimeout(() => {
          if (this.state.message) {
            setTimeout(() => this.props.onTimeout(this.state.message), this.props.timeout || 4000);
          }
        });
      }
    }
  }
  render () {
    return (
      <div className={classNames(style.flashBanner, this.state.message ? style.flashBannerVisible: '')}>
        <span style={this.props.color ? {background: `#${this.props.color}`} : null}>{this.state.message}</span>
      </div>
    );
  }
}
