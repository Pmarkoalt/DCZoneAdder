const {processProperty} = require('./scraper.js');
module.exports.process = (data) => {
  return processProperty(data.data);
};

module.exports.queueConfig = {
  concurrency: 1,
  name: 'tpsc',
};
