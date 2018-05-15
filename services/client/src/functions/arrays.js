import _ from 'underscore';

export const mapLeft = (arr, fn) => {
  const res = [];

  for (let i = arr.length - 1; i > -1; i--) {
    res.push(fn(arr[i], arr.length - 1 - i, arr));
  }

  return res;
};

export const uniq = (arr, fn) => _.uniq(arr, fn);
