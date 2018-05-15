import Promise from 'bluebird';
import instantiate from './instantiate';

export default (Model, opts = {}) => {
  const instantiateModel = instantiate(Model, opts);

  return async (data = [], transaction) => {
    if (data.length < 1) return [];
    if (opts.sequential === true) {
      let instances = [];
      instances.push(await data.reduce((p, d) => p ? p.then((inst) => {
        instances.push(inst);
        return instantiateModel(d, transaction)
      }) : instantiateModel(d, transaction), null));
      return instances;
    }
    return await Promise.all(data.map(d => instantiateModel(d, transaction)));
  };
}
