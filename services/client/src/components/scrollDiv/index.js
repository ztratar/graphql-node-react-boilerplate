import React from 'react';
import PureComponent from 'components/common/pure';

let ScrollDiv;

if (__CLIENT__) {
  const sparkScroll = require('react-spark-scroll-gsap')({
    invalidateAutomatically: true
  })
  ScrollDiv = sparkScroll.SparkScroll.div;
} else {
  ScrollDiv = class ScrollDiv extends PureComponent {
    render() {
      let { children, ...other } = this.props;
      delete other.timeline;
      return <div {...other}>{children}</div>
    }
  }
}

export default ScrollDiv;
