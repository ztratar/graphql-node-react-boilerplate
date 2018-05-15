import _ from 'underscore';

const keyTypeNameMapper = {
  'CurrentLocation': 'Location',
  'Location': 'Location',

  'Post': 'Post',
  'Posts': 'Post',

  'User': 'User',
  'Users': 'User',
  'Creator': 'User',

  'File': 'File',
  'Files': 'File',
  'Avatar': 'File',
  'Image': 'File',

  'Topic': 'Topic',
  'Topics': 'Topic'
};

// This function is used to apply __typenames
// to apllo optimistic payloads in order to create
// symmetry with graphql updateQuerie
const typenamify = (obj = {}, apply, doNotCopy) => {
  if (!obj) return obj;

  if (!doNotCopy) {
    obj = JSON.parse(JSON.stringify(obj));
  }

  if (apply && !obj.__typename) obj.__typename = apply;
  if (apply && !obj.id) obj.id = 'OPTIMISTIC_TEMP';

  _.each(obj, (keyVal, key) => {
    var toApply = keyTypeNameMapper[key];

    if (toApply && _.isArray(keyVal)) {
      _.each(keyVal, (val) => typenamify(val, toApply, true));
    } else if (toApply) {
      obj[key] = typenamify(keyVal, toApply, true);
    }
  });

  return obj;
};

export default typenamify;
