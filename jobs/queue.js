const Queue = require('bull');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const queues = {};

function getQueue(name) {
  if (!queues[name]) {
    queues[name] = {
      queue: new Queue(name, REDIS_URL),
      interval: setInterval(() => {
        const queue = queues[name].queue;
        if (queue) {
          queue.clean(10, 'completed').then(() => {
            console.log(`${name} queue: completed tasks cleaned.`);
          });
        }
      }, 1000 * 60 * 10), // clear completed every 10 minutes
    }
  }
  return queues[name].queue;
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
