const {CSVJob, CSVJobTask, JOB_TYPES} = require('./models.js');
const {generateId} = require('./utils');
const {getQueue, initQueues} = require('./queue');

const TASK_HANDLERS = {
  [JOB_TYPES.ZONE]: require('./zone').process,
  [JOB_TYPES.TPSC]: require('./tpsc').process,
};

const JOB_INPUT_PARSERS = {
  [JOB_TYPES.ZONE]: require('./zone').parse,
  [JOB_TYPES.TPSC]: require('./tpsc').parse,
};

// const JOB_TASK_CONTEXT = {
//   [JOB_TYPES.ZONE]: require('./zone').onTaskCreate,
//   [JOB_TYPES.TPSC]: require('./tpsc').onTaskCreate,
// };

module.exports.listJobs = () => {
  return new Promise((resolve, reject) => {
    CSVJob.find({}, '-tasks', (err, jobs) => {
      if (err) return reject(err);
      return resolve(jobs);
    }).lean();
  });
};

module.exports.findJob = (jobId) => {
  return new Promise((resolve, reject) => {
    CSVJob.findOne({id: jobId}, '-tasks', (err, job) => {
      if (err) return reject(err);
      return resolve(job);
    }).lean();
  });
};

module.exports.getJobResultCSVString = async (jobId) => {
  const results = await CSVJob.findOne({id: jobId}).populate({
    path: 'tasks',
    match: {completed: true, error: undefined},
    select: 'result',
  });
  if (!results || !results.length) return null;
  const keys = job.csv_export_fields.length > 0 ? job.csv_export_fields : Object.keys(results[0]);
  const parser = new Parser({fields: keys, excelStrings: true});
  const csv = parser.parse(results);
  return csv;
};

module.exports.createJob = (jobType, data) => {
  return new Promise((resolve, reject) => {
    const parse = JOB_INPUT_PARSERS[jobType];
    const input = parse ? parse(data) : data;
    const job = new CSVJob({
      id: generateId(),
      total_items: input.length,
      type: jobType,
      tasks: [],
      export_file_name: req.body.export_file_name,
      csv_export_fields: req.body.csv_export_fields,
    });
    job.save(async (err, job) => {
      if (err) return reject(err);
      const taskData = input.map((item) => {
        return {
          data: item,
          job: job._id,
        };
      });
      const tasks = await CSVJobTask.create(taskData);
      job.tasks.push(...tasks.map((t) => t._id));
      const queue = getQueue(jobType);
      // const provideContext = JOB_TASK_CONTEXT[jobType];
      tasks.forEach((task) => {
        // const context = provideContext ? provideContext(job, task) : {};
        queue.add({context: job.context, data: task.data, taskId: task._id, type: job.type});
      });
      return resolve(job);
    });
  });
};

module.exports.deleteJob = async (jobId) => {
  try {
    const job = await CSVJob.deleteOne({id: jobId}).exec();
    return job;
  } catch (err) {
    return Promise.reject(err);
  }
};

const processTask = (context) => {
  return new Promise((resolve, reject) => {
    CSVJobTask.findOneAndUpdate({_id: context.taskId}, {start_time: Date.now()}, async (err, task) => {
      if (err) return reject(err);
      try {
        const result = await TASK_HANDLERS[context.type](context);
        task.completed = true;
        task.end_time = Date.now();
        task.duration = task.end_time - task.start_time.getTime();
        task.result = result;
        task.save((err) => {
          if (err) return reject(err);
          return resolve(result);
        });
      } catch (e) {
        const error = e && e.toString ? e.toString() : e;
        task.error = error;
        task.completed = true;
        task.end_time = Date.now();
        task.duration = task.end_time - task.start_time.getTime();
        task.save((err) => {
          reject(err || e);
        });
      }
    });
  });
};

module.exports.init = () => {
  initQueues(processTask);
};
