import stats from 'datadog-metrics';

import {
  DATADOG_API_KEY,
  DATADOG_APP_KEY
} from '../../config/environment';

let lastStats = null;

function collectProcessMetrics () {
  lastStats = lastStats || {};
  const { rss, heapTotal, heapUsed } = process.memoryUsage();
  stats.gauge('memory.rss', rss);
  stats.gauge('memory.heapTotal', heapTotal);
  stats.gauge('memory.heapUsed', heapUsed);
  lastStats.memory = {
    rss,
    heapTotal,
    heapUsed
  };

  if (typeof process.cpuUsage === 'function') { //works on node 6 only
    const { system, user } = process.cpuUsage();
    stats.gauge('cpu.system', system);
    stats.gauge('cpu.user', user);
    lastStats.cpu = {
      system,
      user
    };
  }
}

if (DATADOG_API_KEY && DATADOG_APP_KEY) {
  stats.init({
    host: 'graphql',
    prefix: 'graphql.',
    apiKey: DATADOG_API_KEY,
    appKey: DATADOG_APP_KEY
  });
  setInterval(collectProcessMetrics, 5000);
  collectProcessMetrics();
}

export function getLastStats () {
  return lastStats
};

export const increment = ns => {
  if (DATADOG_API_KEY && DATADOG_APP_KEY) {
    stats.increment(ns);
  }
};

export const gauge = (ns, data) => {
  if (DATADOG_API_KEY && DATADOG_APP_KEY) {
    stats.gauge(ns, data);
  }
};

export default stats;
