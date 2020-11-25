const {getSSL, processProperty} = require('./scraper.js');
module.exports.process = (data) => {
  // const ssl = getSSL(data);
  // // let result = TASK_CACHE[TASK_TYPES.TPSC][ssl];
  // // if (!result) {
  // //   result = await processProperty(data);
  // //   TASK_CACHE[TASK_TYPES.TPSC][ssl] = result;
  // // }
  return processProperty(data.data);
  // return new Promise((resolve, reject) => {
  //   job.save((err) => {
  //     if (err) return reject(err);
  //     resolve(result);
  //   });
  // });
};

module.exports.queueConfig = {
  concurrency: 1,
  name: 'tpsc',
};
