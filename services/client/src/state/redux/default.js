import Immutable from 'immutable';
import cookie from 'react-cookie';

import favicon from '../../assets/images/favicon.png';
import openGraphPrimaryImage from '../../assets/images/og_primary.png';

export default {
  apollo: {},
  app: Immutable.fromJS({
    rendered: false,
    form: {},
    auth: {
      token: null,
      identified: false,
      appAccess: true
    },
    browser: {
      window: {
        height: 0,
        width: 0
      },
      bodyScrollOffset: 0
    },
    meta: {
      title: 'GraphQL React Node Boilerplate',
      description: 'An app boilerplate',
      icon: favicon,
      image: 'https://link-to-image.com/image.png'
    },
    fqdn: '',
    alerts: [],
    experiment: {}
  })
}
