import { Router } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import debug from 'debug';
import compression from 'compression';
import { Z_BEST_COMPRESSION } from 'zlib';
import { graphiqlExpress } from 'graphql-server-express';
import multer from 'multer';
import OpticsAgent from 'optics-agent';

import rest from './rest';

import {
  authMiddleware,
  contextMiddleware,
  gqlMiddleware,
  fileUpload as fileUploadHandler,
  errorHandler,
  requestHandler
} from './middleware';

import emailRenderer from './io/emailRenderer';
import emails from './emails';

const log = debug('graphql:router');

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

// MUST BE `files` for https://github.com/HriBB/graphql-server-express-upload
const uploadMiddleware = upload.array('files');

// Don't attempt to parse files unless we are authenticated
const authenticatedUploadMiddleware = (req, res, next) => {
  if (req.user) return uploadMiddleware(req, res, next);
  return next();
};

router.use(requestHandler);

if (__PRODUCTION__) {
  router.use(OpticsAgent.middleware());
}

if (__PRODUCTION__) {
  router.use('/*', compression({
    level: Z_BEST_COMPRESSION
  }));
}

router.use('/graphql',
  cookieParser(),
  authMiddleware,
  bodyParser.json({
    limit: '10mb'
  }),
  authenticatedUploadMiddleware,
  (req, res, next) => {
    log('received graphql');
    next();
  },
  contextMiddleware,
  gqlMiddleware
);

router.use('/rest',
  cookieParser(),
  authMiddleware,
  bodyParser.json({
    limit: '10mb'
  }),
  authenticatedUploadMiddleware,
  (req, res, next) => {
   log('received REST request %s', req.url);
   next();
  },
  contextMiddleware,
  rest
);

router.use(fileUploadHandler);
router.use(errorHandler);

if (__DEV__) {
  log('GraphiQL UI enabled');
  router.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));

  router.get('/emails/:templateName', bodyParser.json(), (req, res) => {
    res.status(200).send(emailRenderer(emails[req.params.templateName], req.query));
  });
}

router.use((err, req, res, next) => {
  res.status(500).send({
    message: 'unknown error'
  });
});

export default router;
