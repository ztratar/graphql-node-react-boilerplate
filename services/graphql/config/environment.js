// System
export const HOSTNAME = process.env.HOSTNAME || 'localhost';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const WEBPACK_PORT = process.env.GRAPHQL_WEBPACK_PORT;
export const PORT = process.env.PORT || process.env.GRAPHQL_SERVER_PORT;
export const CLIENT_WEBPACK_PORT = process.env.CLIENT_WEBPACK_PORT;
export const CLIENT_SERVER_PORT = process.env.CLIENT_SERVER_PORT;

// Frontend
export const CLIENT_FQDN = process.env.CLIENT_FQDN || `http://localhost:${CLIENT_SERVER_PORT}`;

// Self
export const GRAPHQL_FQDN = process.env.GRAPHQL_FQDN || `http://localhost:${PORT}`;

// Redis
export const REDIS_URL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

// Postgres
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_HOST = process.env.POSTGRES_HOST;
export const POSTGRES_PORT = process.env.POSTGRES_PORT;
export const POSTGRES_DB = process.env.POSTGRES_DB;

export const POSTGRES_URL = process.env.POSTGRES_URL || (
  `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`
);

// Elasticsearch
export const ELASTICSEARCH_FQDNS = process.env.ELASTICSEARCH_FQDNS.split(',');

// RabbitMQ
export const RABBITMQ_URL = process.env.RABBITMQ_URL;

// Etcd
export const ETCD_URLS = (process.env.ETCD_URLS || '').replace(/ /g,'').split(',');

// Auth
export const JWT_SECRET = process.env.JWT_SECRET;
export const REDIRECT_JWT_SECRET = process.env.REDIRECT_JWT_SECRET;

// Google
export const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Facebook
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;

// Stripe
export const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID;
export const STRIPE_CLIENT_SECRET = process.env.STRIPE_CLIENT_SECRET;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Sendgrid
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const SENDGRID_WEBHOOK_SECRET = process.env.SENDGRID_WEBHOOK_SECRET;

// Sentry
export const SENTRY_DSN = process.env.SENTRY_DSN || process.env.GRAPHQL_SENTRY_DSN;

// Segment
export const SEGMENT_SHARED_SECRET = process.env.SEGMENT_SHARED_SECRET;

// Slack
export const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;
export const SLACK_BOT_USERNAME = process.env.SLACK_BOT_USERNAME;
export const SLACK_BOT_ICON_URL = process.env.SLACK_BOT_ICON_URL;

// Twilio
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_ACCOUNT_AUTH_TOKEN = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
export const TWILIO_WEBHOOK_SECRET = process.env.TWILIO_WEBHOOK_SECRET;

// AWS
export const AWS_USER_FILE_BUCKET = process.env.AWS_USER_FILE_BUCKET;
export const AWS_USER_FILE_ACCESS_KEY_ID = process.env.AWS_USER_FILE_ACCESS_KEY_ID;
export const AWS_USER_FILE_SECRET_ACCESS_KEY = process.env.AWS_USER_FILE_SECRET_ACCESS_KEY;
export const AWS_USER_FILE_REGION = process.env.AWS_USER_FILE_REGION;
export const AWS_USER_FILE_ACL = process.env.AWS_USER_FILE_ACL;
export const AWS_USER_FILE_CLOUDFRONT_FQDN = process.env.AWS_USER_FILE_CLOUDFRONT_FQDN;

// Intercom
export const INTERCOM_API_TOKEN = process.env.INTERCOM_API_TOKEN;

// Datadog
export const DATADOG_API_KEY = process.env.DATADOG_API_KEY || null;
export const DATADOG_APP_KEY = process.env.DATADOG_APP_KEY || null;
