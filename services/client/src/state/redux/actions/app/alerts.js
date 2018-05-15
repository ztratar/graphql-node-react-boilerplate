import { createAction } from 'redux-actions';

export const TYPES = {
  add: 'alerts.add',
  remove: 'alerts.remove'
};

export const add = createAction(TYPES.add, ({
  id,
  text,
  color,
  timeout,
  onTimeout
}) => ({ id, text, color, timeout, onTimeout }));

export const remove = createAction(TYPES.remove, (id) => id);
