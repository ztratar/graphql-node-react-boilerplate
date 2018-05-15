import cookie from 'react-cookie';
import _ from 'underscore';

export default ({ path = '/', disabled = false }) => store => next => action => {
  if (disabled) return next(action);
  if (action && action.meta && action.meta.cookie) {
    if (action.meta.cookie.save) {
      if (_.isObject(action.meta.cookie.save)) {
        cookie.save(action.meta.cookie.save.key, action.meta.cookie.save.value, { path });
      } else if (_.isArray(action.meta.cookie.save)) {
        action.meta.cookie.save.forEach((d) => cookie.save(d.key, d.value, { path }));
      }
    }
    if (action.meta.cookie.remove) {
      if (_.isObject(action.meta.cookie.remove)) {
        cookie.remove(action.meta.cookie.remove.key, { path });
      } else if (_.isArray(action.meta.cookie.remove)) {
        action.meta.cookie.remove.forEach((d) => cookie.remove(d.key, { path }));
      }
    }
  }
  next(action);
};
