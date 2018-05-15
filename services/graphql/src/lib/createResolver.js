import _ from 'underscore';
import objectPath from 'object-path';
import { createError } from 'apollo-errors';

const FieldRequiredError = createError('FieldRequiredError', {
  message: 'Missing required field',
  data: {
    path: 'unknown'
  }
});

const pathExists = (key = '', obj = {}) => {
  if (key.indexOf('&&') !== -1) return key.split(/\s*\&\&\s*/).reduce((bool, key) => bool && pathExists(key.trim(), obj), true);
  if (key.indexOf('||') !== -1) return key.split(/\s*\|\|\s*/).reduce((bool, key) => bool || pathExists(key.trim(), obj), false);
  key = key.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties

  const val = objectPath.get(obj, key);

  return (
    val !== undefined &&
    val !== null &&
    val !== ''
  );
};


export const createRequiredFieldsValidator = (fields = {}) => (root, args, context) => {
  Object.keys(fields).forEach(key => {
    if (!pathExists(key, args)) throw new FieldRequiredError({
      message: fields[key],
      data: {
        path: key
      }
    });
  });
  return true;
};

const createResolver = (resFn, errFn) => {
  const baseResolver = async (root, args = {}, context = {}) => {
    try {
      if (!_.isFunction(resFn)) return null;
      return await resFn(root, args, context);
    } catch (err) {
      if (!_.isFunction(errFn)) throw err;
      const parsedError = await errFn(root, args, context, err);
      throw parsedError || err;
    }
  };

  baseResolver.createResolver = (cResFn, cErrFn) => createResolver(
    async (root, args, context) => {
      const r = _.isFunction(resFn) ? await resFn(root, args, context) : null;
      if (r) return r;
      return _.isFunction(cResFn) ? await cResFn(root, args, context) : null;
    },
    async (root, args, context, err) => {
      const r = _.isFunction(errFn) ? await errFn(root, args, context, err) : null;
      if (r) throw r;
      const cR = _.isFunction(cErrFn) ? await cErrFn(root, args, context, err) : null;
      return cR || err;
    }
  );

  baseResolver.requireArgs = (fields = {}) => {
    const validate = createRequiredFieldsValidator(fields)
    return createResolver(
      async (root, args, context) => {
        return validate(root, args, context) && _.isFunction(resFn) ? await resFn(root, args, context) : null;
      }
    )
  };

  return baseResolver;
};

export default createResolver;
