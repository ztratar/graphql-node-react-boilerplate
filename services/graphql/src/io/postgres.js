import Sequelize from 'sequelize';
import debug from 'debug';

const log = debug('graphql:io:postgres');

import {
  POSTGRES_URL,
  NODE_ENV
} from '../../config/environment';


const dialectOptions = NODE_ENV !== 'development' ? {
  'SSL_VERIFY_SERVER_CERT': process.env.SSL_PATH || `${process.cwd()}/ssl/postgres.pem`
} : {};

const sequelizePostgres = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: log,
  benchmark: NODE_ENV === 'development',
  native: NODE_ENV !== 'development' ? true : false,
  pool: {
    min: 1
  },
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  dialectOptions
});

export default sequelizePostgres;
