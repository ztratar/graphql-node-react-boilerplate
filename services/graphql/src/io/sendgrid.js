import sendgrid from 'sendgrid';

import {
  SENDGRID_API_KEY
} from '../../config/environment';

const client = sendgrid(SENDGRID_API_KEY);

export default client;
