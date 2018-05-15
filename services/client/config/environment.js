export const NODE_ENV = process.env.NODE_ENV || 'development';
export const HOSTNAME = process.env.HOSTNAME || 'localhost';
export const WEBPACK_PORT = process.env.CLIENT_WEBPACK_PORT;
export const PORT = process.env.PORT || process.env.CLIENT_SERVER_PORT;
export const GRAPHQL_FQDN = process.env.GRAPHQL_FQDN;
export const BROWSER_GRAPHQL_FQDN = process.env.BROWSER_GRAPHQL_FQDN || GRAPHQL_FQDN;
export const ASSETS_FQDN = NODE_ENV !== 'development' ? '' : `http://localhost:${WEBPACK_PORT}`;
export const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID;

// Build stuff
export const BUILD_STAMP = NODE_ENV !== 'development' ? process.env.BUILD_STAMP || null : null;
export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || null;
export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || null;
export const S3_REGION = process.env.S3_REGION || null;
export const S3_BUCKET = process.env.S3_BUCKET || null;
export const CF_DISTRIBUTION_ID = process.env.CF_DISTRIBUTION_ID || null;

// Thirdy-party services
export const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY || null;
export const SENTRY_BROWSER_DSN = process.env.CLIENT_SENTRY_BROWSER_DSN || process.env.SENTRY_BROWSER_DSN || null;
export const SENTRY_NODE_DSN = process.env.CLIENT_SENTRY_NODE_DSN || process.env.SENTRY_NODE_DSN || null;

// Status Page
export const FORCE_STATUS_PAGE = process.env.FORCE_STATUS_PAGE === 'true';

// Redirects
export const REDIRECT_JWT_SECRET = process.env.REDIRECT_JWT_SECRET;
