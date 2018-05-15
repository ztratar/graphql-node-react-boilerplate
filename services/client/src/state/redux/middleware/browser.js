import _ from 'underscore';

export default ({
  disabled = false // pass true on server to disable
}) => store => {
  if (!disabled) {
    let dispatchScroll = _.throttle((e) => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      store.dispatch({
        type: 'BODY_SCROLL',
        meta: { suppressLog: true },
        payload: scrollTop
      });
    }, 15);

    let dispatchResize = _.throttle((e) => {
      store.dispatch({
        type: 'WINDOW_RESIZE',
        meta: { suppressLog: true },
        payload: {
          width: window.document.body.clientWidth,
          height: window.innerHeight
        }
      });
    }, 15);

    window.addEventListener('scroll', dispatchScroll);
    window.addEventListener('touchmove', dispatchScroll);
    window.addEventListener('resize', dispatchResize);

    dispatchResize();
  }

  return next => action => next(action); //do nothing with actions
}
