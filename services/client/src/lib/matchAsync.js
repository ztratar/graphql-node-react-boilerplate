import { match } from 'react-router';

export default function matchAsync (props) {
  return new Promise((resolve, reject) => match(props, (err, redirectLocation, renderProps) => {
    if (err) return reject(err);
    return resolve({
      redirectLocation: redirectLocation,
      renderProps: renderProps
    });
  }));
}
