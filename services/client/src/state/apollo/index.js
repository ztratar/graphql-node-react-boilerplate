import ApolloClient, { createBatchingNetworkInterface } from 'apollo-client';
import version from 'apollo-client/version';
import { Client as SubClient } from 'subscriptions-transport-ws';

import mixinSubscriptions from './mixins/subscriptions';

const dataIdFromObject = (inst) => `${inst.__typename}_${inst.id}`;

import { auth } from './middleware';

const networkInterfaceMiddleware = [
  auth
];

export default ({
  headers,
  token,
  FQDN
}) => {
  const proto = {
    batchInterval: 10,
    uri: `${FQDN}/graphql`,
    opts: {
      headers: {
        cookie: (headers || {}).cookie || undefined
      }
    }
  };

  let networkInterface = createBatchingNetworkInterface(proto);

  let ssrMode = false;

  let connectToDevTools = false;

  if (__CLIENT__ && token) {
    networkInterface = mixinSubscriptions(networkInterface, FQDN, token);
    if (__NODE_ENV__ === 'development') {
      connectToDevTools = true;
    }
  } else {
    ssrMode = true;
  }

  const apolloClient = new ApolloClient({
    networkInterface,
    dataIdFromObject,
    ssrMode,
    connectToDevTools,
    queryDeduplication: true
  });

  networkInterface.applyMiddleware = deps => networkInterfaceMiddleware.reduce(
    (networkInterface, middleware) => networkInterface.use(middleware(deps)),
    networkInterface
  );

  return {
    apolloClient,
    networkInterface
  };
}
