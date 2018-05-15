import Promise from 'bluebird';
import ensure from './ensure';

export default (Error, data = {}) => {
  const ensureModel = ensure(Error, data);
  return (val = []) => val.map((v) => ensureModel(v));
}
