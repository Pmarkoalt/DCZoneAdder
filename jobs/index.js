const {Parser} = require('json2csv');
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
    CSVJob.findOne({id: jobId}, (err, job) => {
      if (err) return reject(err);
      return resolve(job);
    })
      .populate('tasks')
      .lean();
  });
};

module.exports.getJobResultCSVString = async (jobId) => {
  try {
    const job = await CSVJob.findOne({id: jobId}).populate({
      path: 'tasks',
      match: {completed: true, error: undefined},
      select: 'result',
    });
    const results = job.tasks.map((t) => t.result);
    if (!results || !results.length) return null;
    const keys = job.csv_export_fields.length > 0 ? job.csv_export_fields : Object.keys(results[0]);
    const parser = new Parser({fields: keys, excelStrings: true});
    const csv = parser.parse(results);
    return csv;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

module.exports.createJob = (jobData) => {
  return new Promise((resolve, reject) => {
    try {
      const {type, data, context, meta} = jobData;
      const parse = JOB_INPUT_PARSERS[type];
      const input = parse ? parse(data) : data;
      const _job = new CSVJob({
        id: generateId(),
        total_tasks: input.length,
        type,
        tasks: [],
        context,
        export_file_name: meta.export_file_name,
        csv_export_fields: meta.csv_export_fields,
      });
      _job.save(async (err, job) => {
        if (err) return reject(err);
        const taskData = input.map((item) => {
          return {
            data: item,
            job: job._id,
          };
        });
        const tasks = await CSVJobTask.create(taskData);
        job.tasks.push(...tasks.map((t) => t._id));
        job.save((err) => {
          if (err) return reject(err);
          const queue = getQueue(job.type);
          // const provideContext = JOB_TASK_CONTEXT[jobType];
          tasks.forEach((task) => {
            // const context = provideContext ? provideContext(job, task) : {};
            queue.add({context: job.context, data: task.data, taskId: task._id, type: job.type});
          });
          return resolve(job);
        });
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

module.exports.deleteJob = async (jobId) => {
  try {
    const result = await CSVJob.deleteOne({id: jobId}).exec();
    return result;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const processTask = (taskMeta) => {
  const context = taskMeta.data;
  return new Promise((resolve, reject) => {
    CSVJobTask.findOneAndUpdate({_id: context.taskId}, {start_time: Date.now()}, {new: true}, async (err, task) => {
      if (err) return reject(err);
      if (!task) return reject(`Could not find task ${conext.taskId}`);
      try {
        const result = await TASK_HANDLERS[context.type](context, taskMeta);
        task.completed = true;
        task.end_time = Date.now();
        task.duration = task.end_time - task.start_time.getTime();
        task.result = result;
        task.save((err) => {
          if (err) return reject(err);
          return resolve(result);
        });
      } catch (e) {
        console.log(e);
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
