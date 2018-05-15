import { createAction } from 'redux-actions';

export const TYPES = {
  set: 'fqdn.set'
};

export const set = createAction(TYPES.set);
