import { createAction } from 'redux-actions';

export const TYPES = {
  set: 'meta.set',
  revert: 'meta.revert'
};

export const set = createAction(TYPES.set, ({
    title,
    description,
    icon,
    image
  }) => ({
    title,
    description,
    icon,
    image
  })
);

export const revert = createAction(TYPES.revert);
