import _ from 'underscore';

const invert = (obj = {}, oldRoot, newRoot) => obj ? ({
  ...obj[newRoot],
  [oldRoot]: {
    ..._.omit(obj, newRoot)
  }
}) : null;

export default invert;
