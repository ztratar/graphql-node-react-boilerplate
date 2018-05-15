import debug from 'debug';

const log = debug('graphql:log');
const warn = debug('graphql:warn');
const info = debug('graphql:info');
const db = debug('graphql:debug');

function error () {
  console.error.apply(console, arguments);
}

function trace () {
  console.trace.apply(console, arguments);
}

class Logger {
  constructor () {
    this.log = log;
    this.warn = warn;
    this.info = info;
    this.debug = db;
    this.error = error;
    this.trace = trace;
  }
}

export {
  log,
  warn,
  info,
  db as debug,
  error,
  trace,
  Logger
}
