import debug from 'debug';
import gql from 'graphql-tag';

import userFragment from './fragments/user';
import reload from './lib/reload';
import { setLoggedIn, setLoggedOut, setIdentified, setKiosk, unsetKiosk } from './state/redux/actions/app/auth';

const log = debug('client:jobstart_repl');

class JobstartREPL {
  constructor ({ client, store }) {
    this._client = client;
    this._store = store;
  }
  async adminLogin (email, password) {
    try {
      const { data: { user } } = await this._client.mutate({
        mutation: gql`
          mutation userLogin ($input: UserLoginInput!) {
            user: userLogin (input: $input) {
              ...UserFragment
            }
          }
          ${userFragment}
        `,
        variables: {
          input: {
            email,
            password
          }
        }
      });
      if (user.isAdmin) {
        this._store.dispatch(setLoggedIn(user.token))
        this._store.dispatch(setIdentified(user));
        log(`successfully logged in user with email ${email} as an admin: %O`, user);
      } else {
        log(`user with email ${email} is not an admin`);
      }
    } catch (e) {
      log(`failed to login user with email ${email} as an admin: %O`, e);
    }
  }
  async spoofUser (email, route = '/') {
    try {
      const { data: { user } } = await this._client.mutate({
        mutation: gql`
          mutation userSpoof ($input: UserSpoofInput!) {
            user: userSpoof (input: $input) {
              ...UserFragment
            }
          }
          ${userFragment}
        `,
        variables: {
          input: {
            email
          }
        }
      });

      if (!user) {
        log(`could not find user with email "${email}"`);
      }
      this._store.dispatch(setLoggedIn(user.token));
      log(`successfully spoofed user with email "${email}".  reloading app...`);
      reload(route, 1000);
    } catch (e) {
      log(`failed to spoof user with email ${email}: %O`, e);
    }
  }
  setKiosk () {
    this._store.dispatch(setKiosk());
    this._store.dispatch(setLoggedOut());
    reload('/');
  }
  unsetKiosk () {
    this._store.dispatch(unsetKiosk());
    reload('/');
  }
}

export default (data) => {
  window.jobstart = new JobstartREPL(data);
};
