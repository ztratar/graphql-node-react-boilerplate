import { createAction } from 'redux-actions';
import { EventTypes } from 'redux-segment';

export const TYPES = {
  setLoggedIn: 'auth.set_logged_in',
  setLoggedOut: 'auth.set_logged_out',
  setIdentified: 'auth.set_identified',
  noAppAccess: 'auth.no_app_access'
};

export const setLoggedIn = createAction(TYPES.setLoggedIn, token => token, (token) => ({
  cookie: {
    save: {
      key: 'token',
      value: token
    }
  }
}));

export const setLoggedOut = createAction(TYPES.setLoggedOut, d => d, () => ({
  cookie: {
    remove: {
      key: 'token'
    }
  }
}));

export const noAppAccess = createAction(TYPES.noAppAccess, d => d);

export const setIdentified = createAction(TYPES.setIdentified, d => d, (user) => ({
  analytics: {
    eventType: EventTypes.identify,
    eventPayload: {
      userId: user.id,
      traits: {
        email: user.email,
        name: user.name,
        created: user.createdAt,
        last_login: new Date(),
        $email: user.email,
        $name: user.name,
        $created: user.createdAt,
        $last_login: new Date()
      }
    }
  }
}));
