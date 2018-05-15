import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

// quick way to add the subscribe and unsubscribe functions to the network interface
export default (networkInterface, FDQN, token) => {
  const WS_FQDN = FDQN.indexOf('https') !== -1 ? FDQN.replace('https', 'wss') : FDQN.replace('http', 'ws');

  const wsClient = new SubscriptionClient(WS_FQDN, {
    connectionParams: {
      token
    },
    reconnect: true
  });

  return addGraphQLSubscriptions(networkInterface, wsClient);
}
