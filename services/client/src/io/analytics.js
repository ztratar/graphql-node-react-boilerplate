let analyticsLoader = () => ({
  track: () => {},
  page: () => {},
  identify: () => {}
});

if (__CLIENT__) {
  analyticsLoader = require('analytics.js-loader');
}

export default analyticsLoader({
  writeKey: __SEGMENT_WRITE_KEY__,
  skipPageCall: true
});
