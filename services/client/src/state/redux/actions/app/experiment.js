import { createAction } from 'redux-actions';
import { EventTypes } from 'redux-segment';

export const TYPES = {
  choose: 'experiment.choose',
  set: 'experiment.set',
  clear: 'experiment.clear',
  load: 'experiment.load'
};

const EXPERIMENT_VIEWED_KEY = 'Experiment Viewed'; // REQUIRED!!! for segment

export const choose = createAction(TYPES.choose, (d) => d, ({experiment_id, experiment_name, variation_id, variation_name}) => ({
  analytics: {
    eventType: EventTypes.track,
    eventPayload: {
      event: EXPERIMENT_VIEWED_KEY,
      properties: {
        experiment_id,
        experiment_name,
        variation_id,
        variation_name
      }
    }
  }
}));

export const set = createAction(TYPES.set, (d) => (d), ({ key, value }) => ({
  cookie: {
    save: {
      key: `AB_TEST_${key}`,
      value
    }
  }
}));

export const clear = createAction(TYPES.clear, (d) => (d), ({ key }) => ({
  cookie: {
    remove: {
      key: `AB_TEST_${key}`
    }
  }
}));

export const load = createAction(TYPES.load, (key, value) => ({
  key,
  value
}));
