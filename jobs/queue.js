const Queue = require('bull');
const {processTask} = require('.');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const queues = {};

function getQueue(name) {
  if (!queues[name]) {
    queues[name] = new Queue(name, REDIS_URL);
  }
  return queues[name];
}

module.exports.getQueue = getQueue;

module.exports.initQueues = (processFunction, {onSuccess, onError}) => {
  const configs = [require('./zone').queueConfig, require('./tpsc').queueConfig];
  configs.forEach((config) => {
    const queue = getQueue(config.name);
    queue.process(config.concurrency, processFunction);
    queue.on('error', (error) => {
      console.log(`${config.name} Queue Error:`, error);
    });
    queue.on('completed', (task) => {
      console.log(`${config.name} task complete`, task.id);
      onSuccess(task.data);
    });
  });
};
