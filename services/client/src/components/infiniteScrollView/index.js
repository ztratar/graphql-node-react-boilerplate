import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { autobind, throttle } from 'core-decorators';
import withStyles from 'isomorph-style-loader/lib/withStyles';
import PureComponent from 'components/common/pure';
import Loader from 'components/loader';

import style from './index.css';

@withStyles(style)
export default class InfiniteScrollView extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    bindTriggerToSelf: PropTypes.bool,
    onTriggerTop: PropTypes.func,
    onTriggerBottom: PropTypes.func,
    isLoading: PropTypes.bool,
    triggerOffset: PropTypes.number
  };

  static defaultProps = {
    className: '',
    bindTriggerToSelf: false,
    onTriggerTop: d => d,
    onTriggerBottom: d => d,
    subscribe: d => d,
    isLoading: false,
    isTopLoading: false,
    triggerOffset: 120
  };

  constructor (props, context) {
    super(props, context);

    this.skipNextScroll = false;
  }

  componentDidMount () {
    this.boundView = this.props.bindTriggerToSelf ? this.refs.infScrollView : window;
    this.boundView.addEventListener('scroll', this._scrolling);
    this._scrolling();
  }

  componentWillUnmount () {
    this.boundView.removeEventListener('scroll', this._scrolling);
  }

  scrollTo (position) {
    this.skipNextScroll = true;
    if (this.boundView === window) {
      this.boundView.scrollTo(0, position);
    } else {
      this.boundView.scrollTop = position;
    }
  }

  @autobind
  @throttle(50)
  _scrolling () {
    if (this.skipNextScroll) {
      this.skipNextScroll = false;
      return;
    }

    let windowHeight = document.documentElement.clientHeight || window.innerHeight;

    let scrollTop = this.props.bindTriggerToSelf ? this.boundView.scrollTop : (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

    let scrollBottom = this.props.bindTriggerToSelf ? this.boundView.scrollBottom : (windowHeight - (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0));

    let totalScroll = this.props.bindTriggerToSelf ?
      this.boundView.scrollHeight
      :
      Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );

    let scrollBottomLeft = totalScroll - scrollTop - windowHeight;
    let scrollTopLeft = scrollTop;

    this.props.subscribe({
      totalScroll,
      scrollTop,
      scrollTopLeft
    });

    if (!this.props.isTopLoading && scrollTopLeft <= this.props.triggerOffset) {
      this.props.onTriggerTop(scrollTopLeft);
    }

    if (!this.props.isLoading && scrollBottomLeft <= this.props.triggerOffset) {
      this.props.onTriggerBottom(scrollBottomLeft)
    }
  }

  render () {
    return (
      <div
        ref='infScrollView'
        className={classNames(style.infiniteScrollView, this.props.className)}
      >
        {this.props.isTopLoading ? <div className={classNames(style.loader, style.topLoader)}><Loader/></div> : null}
        <div className={style.infiniteScrollChildren}>
          {this.props.children}
        </div>
        {this.props.isLoading ? <div className={style.loader}><Loader/></div> : null}
      </div>
    );
  }
}
