import debug from 'debug';

const log = debug('client:log');
const info = debug('client:info')
const warn = debug('client:warn');

function trace () {
  console.trace.apply(console, arguments);
}

export {
  log,
  info,
  warn,
  trace
};
