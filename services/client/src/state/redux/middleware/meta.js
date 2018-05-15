import { TYPES } from '../actions/app/meta';
import defaultState from '../default';

const getMetaEl = (property) => {
  return document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`) || null;
};

const setMetaContent = (property, content) => {
  const el = getMetaEl(property);
  if (el) el.setAttribute('content', content || '');
};

const setLinkHref = (name, href) => {
  const el = document.querySelector(`link[name="${name}"]`);
  if (el) el.setAttribute('href', href);
};

const setTitle = title => {
  document.title = title;
};

export default store => {
  const { routing: { locationBeforeTransitions: { pathname, search } } } = store.getState();
  const fqdn = store.getState().app.get('fqdn');

  let prevUrl = fqdn + pathname + search;
  let prevState = store.getState().app.get('meta').toJSON();

  return next => action => {
    let nextState = null;
    if (action.type === TYPES.revert) nextState = defaultState.app.getIn(['meta']).toJSON();
    if (action.type === TYPES.set) nextState = action.payload;

    if (nextState) {
      const changed = Object.keys(nextState).reduce((bool, key) => bool && prevState[key] !== nextState[key], true);

      if (nextState.title && prevState.title !== nextState.title) {
        setTitle(nextState.title);
        setMetaContent('og:title', nextState.title);
        setMetaContent('twitter:title', nextState.title);
      }

      if (nextState.description && prevState.description !== nextState.description) {
        setMetaContent('description', nextState.description);
        setMetaContent('og:description', nextState.description);
        setMetaContent('twitter:description', nextState.description);
      }

      if (nextState.icon && prevState.icon !== nextState.icon) {
        setLinkHref('icon', nextState.icon);
      }

      if (nextState.image && prevState.image !== nextState.image) {
        setMetaContent('og:image', nextState.image);
        setMetaContent('twitter:image', nextState.image);
      }

      prevState = nextState;
    }

    if (action.type === '@@router/LOCATION_CHANGE') {
      const { pathname, search } = action.payload;

      const fqdn = store.getState().app.get('fqdn');

      const nextUrl = fqdn + pathname + search;

      if (prevUrl !== nextUrl) setMetaContent('og:url', nextUrl);

      prevUrl = nextUrl;
    }

    next(action);
  };
};
