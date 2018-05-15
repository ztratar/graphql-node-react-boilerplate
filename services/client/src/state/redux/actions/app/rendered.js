import { createAction } from 'redux-actions';

export const TYPES = {
  rendered: 'rendered'
};

export const rendered = createAction(TYPES.rendered);
