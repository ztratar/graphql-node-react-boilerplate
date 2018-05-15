import { createAction } from 'redux-actions';

export const TYPES = {
  create: 'form.create',
  update: 'form.update',
  set: 'form.set',
  destroy: 'form.destroy',
};

export const create = createAction(TYPES.create, ({ key, value }) => ({ key, value }));

export const update = createAction(TYPES.update, ({ key, value }) => ({ key, value }));

export const set = createAction(TYPES.set, ({ key, path, value }) => ({ key, path, value }))

export const destroy = createAction(TYPES.destroy, ({ key }) => ({ key }));
