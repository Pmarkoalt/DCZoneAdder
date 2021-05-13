const AdmZip = require('adm-zip');
const {Parser} = require('json2csv');
const {CSVJob, CSVJobTask, JOB_TYPES} = require('./models.js');
const {generateId} = require('./utils');
const {getQueue, initQueues} = require('./queue');
const {goodpropsFilter} = require('../api/open-data-dc/filters.js');
const {leadIdentificationProcess} = require('./leads');

module.exports.JOB_TYPES = JOB_TYPES;

const JOB_CONFIGS = {
  [JOB_TYPES.ZONE]: require('./zone').jobConfig,
  [JOB_TYPES.TPSC]: require('./tpsc').jobConfig,
  [JOB_TYPES.BELLES]: require('./belles').jobConfig,
  [JOB_TYPES.OPEN_DATA_DC]: require('./open-data-dc').jobConfig,
};

const TASK_HANDLERS = {
  [JOB_TYPES.ZONE]: require('./zone').process,
  [JOB_TYPES.TPSC]: require('./tpsc').process,
  [JOB_TYPES.BELLES]: require('./belles').process,
  [JOB_TYPES.OPEN_DATA_DC]: require('./open-data-dc').process,
};

const JOB_INPUT_PARSERS = {
  [JOB_TYPES.ZONE]: require('./zone').parse,
  [JOB_TYPES.TPSC]: require('./tpsc').parse,
  [JOB_TYPES.BELLES]: require('./belles').parse,
  [JOB_TYPES.OPEN_DATA_DC]: require('./open-data-dc').parse,
};

const JOB_RESULTS_PARSERS = {
  [JOB_TYPES.ZONE]: require('./zone').parseResults,
  [JOB_TYPES.TPSC]: require('./tpsc').parseResults,
  [JOB_TYPES.BELLES]: require('./belles').parseResults,
  [JOB_TYPES.OPEN_DATA_DC]: require('./open-data-dc').parseResults,
};

// const JOB_TASK_CONTEXT = {
//   [JOB_TYPES.ZONE]: require('./zone').onTaskCreate,
//   [JOB_TYPES.TPSC]: require('./tpsc').onTaskCreate,
// };

module.exports.listJobs = (jobType) => {
  const query = jobType ? {type: jobType} : {};
  return new Promise((resolve, reject) => {
    CSVJob.find(query, '-tasks', async (err, jobs) => {
      if (err) return reject(err);
      // return resolve(jobs);
      const jobsWithTaskData = await Promise.all(
        jobs.map((job) => {
          return CSVJobTask.aggregate([
            {$match: {job: job._id, completed: true}},
            {$addFields: {hasError: {$toBool: '$error'}}},
            {$group: {_id: '$hasError', count: {$sum: 1}}},
          ]).then((results) => {
            let errorCount = results.find((r) => r._id === true);
            errorCount = errorCount ? errorCount.count : 0;
            let successCount = results.find((r) => r._id === null);
            successCount = successCount ? successCount.count : 0;
            return {
              ...job,
              task_error_count: errorCount,
              task_success_count: successCount,
              task_completed_count: errorCount + successCount,
            };
          });
        }),
      );
      resolve(jobsWithTaskData);
    })
      .lean()
      .sort('-created_timestamp')
      .limit(50);
  });
};

module.exports.findJob = (jobId) => {
  return new Promise((resolve, reject) => {
    CSVJob.findOne({id: jobId}, '-tasks', (err, job) => {
      if (err) return reject(err);
      if (!job) return reject(404);
      return CSVJobTask.aggregate([
        {$match: {job: job._id, completed: true}},
        {$addFields: {hasError: {$toBool: '$error'}}},
        {$group: {_id: '$hasError', count: {$sum: 1}}},
      ]).then((results) => {
        let errorCount = results.find((r) => r._id === true);
        errorCount = errorCount ? errorCount.count : 0;
        let successCount = results.find((r) => r._id === null);
        successCount = successCount ? successCount.count : 0;
        return resolve({
          ...job,
          task_error_count: errorCount,
          task_success_count: successCount,
          task_completed_count: errorCount + successCount,
        });
      });
    }).lean();
  });
};

const getJobResults = async (jobId, hasError, {start = 0, limit} = {}) => {
  try {
    return new Promise((resolve, reject) => {
      CSVJob.findOne({id: jobId}, '_id', (err, job) => {
        if (err) return reject(error);
        if (!job) return reject(404);
        const query = {
          job: job._id,
        };
        if (hasError) {
          query.error = {$ne: undefined};
        } else {
          query.error = undefined;
        }
        const taskQuery = CSVJobTask.find(query, (err, tasks) => {
          if (err) return reject(err);
          return resolve(tasks);
        }).skip(start);
        if (limit !== undefined) {
          taskQuery.limit(limit);
        }
      });
    });
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
module.exports.getJobResults = getJobResults;

module.exports.getJobFailedResultsCSVString = async (jobId) => {
  const failedTasks = await getJobResults(jobId, true);
  const csvData = failedTasks.map((t) => t.data);
  if (!csvData || !csvData.length) return null;
  const keys = Object.keys(csvData[0]);
  const parser = new Parser({fields: keys});
  const csv = parser.parse(csvData);
  return csv;
};

module.exports.getJobResultCSVString = async (jobId, useFilter) => {
  try {
    const job = await CSVJob.findOne({id: jobId}).populate({
      path: 'tasks',
      match: {completed: true, error: undefined},
      select: ['result', 'data'],
    });
    const jobConfig = JOB_CONFIGS[job.type] || {};
    const tasks = useFilter ? goodpropsFilter(job.tasks) : job.tasks;
    let results = tasks.map((t) => {
      if (jobConfig.includeInputDataInExport && t.result) {
        const combinedResult = {...t.data};
        Object.entries(t.result).forEach(([key, val]) => {
          if ((val !== undefined && val !== null) || t[key] == undefined || t[key] == null) {
            combinedResult[key] = val;
          }
        });
        return combinedResult;
      }
      return t.result;
    });
    const resultParser = JOB_RESULTS_PARSERS[job.type];
    if (resultParser) {
      results = resultParser(results, job);
    }
    if (!results || !results.length) return null;
    const keys = job.csv_export_fields.length > 0 ? job.csv_export_fields : Object.keys(results[0]);
    const parser = new Parser({fields: keys, excelStrings: false});
    const csv = parser.parse(results);
    return csv;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

module.exports.getJobInputCSVString = async (jobId) => {
  try {
    const job = await CSVJob.findOne({id: jobId}).populate({
      path: 'tasks',
      select: 'data',
    });
    const input = job.tasks.map((t) => t.data);
    if (!input || !input.length) return null;
    const keys = Object.keys(input[0]);
    const parser = new Parser({fields: keys});
    const csv = parser.parse(input);
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
        console.log('Job created.');
        console.log(`Creating ${input.length} tasks...`);
        const taskData = input.map((item) => {
          return {
            data: item,
            job: job._id,
          };
        });
        const tasks = await CSVJobTask.create(taskData);
        console.log('finished creating db tasks.');
        for (const t of tasks) {
          job.tasks.push(t._id);
        }
        // job.tasks.push(...tasks.map((t) => t._id));
        console.log('Assigning tasks to job.');
        job.save((err) => {
          if (err) return reject(err);
          const queue = getQueue(job.type);
          for (const task of tasks) {
            queue.add({context: job.context, data: task.data, taskId: task._id, type: job.type, jobId: job.id});
          }
          console.log('Job and task creation complete!');
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
  return new Promise((resolve, reject) => {
    try {
      CSVJob.findOneAndRemove({id: jobId}, (err, job) => {
        if (err) return reject(err);
        CSVJobTask.deleteMany({job: job._id}, (err) => {
          if (err) return reject(err);
          return resolve(job);
        });
      });
    } catch (err) {
      console.log(err);
      return reject(err);
    }
  });
};

module.exports.getJobLeadResultsZip = async (jobId, leadType) => {
  try {
    const results = await getJobResults(jobId);
    const resultData = results.map((r) => {
      return {
        ...r.data,
        ...r.result,
      };
    });
    return leadIdentificationProcess(leadType, resultData);
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
      if (!task) return reject(`Could not find task ${context.taskId}`);
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

module.exports.init = (callbacks) => {
  initQueues(processTask, callbacks);
};
