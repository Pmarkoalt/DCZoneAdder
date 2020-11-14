var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const JOB_TYPES = {
  TPSC: 'tpsc',
  ZONE: 'zone',
};

const CSVJobTaskSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  data: Schema.Types.Mixed,
  start_time: {type: Date},
  end_time: {type: Date},
  duration: {type: Number, min: 0},
  completed: {type: Boolean, default: false},
  error: {type: String},
  result: {type: Schema.Types.Mixed},
  job: {type: Schema.Types.ObjectId, ref: 'CSVJob'},
});
CSVJobTaskSchema.pre('save', async (task, next) => {
  if (task.completed && !task.end_time) {
    task.end_time = Date.now();
    task.duration = end_time - task.start_time.getTime();
  }
  next();
});
CSVJobTaskSchema.post('save', async (task, next) => {
  if (!task.completed || task.error) return next();
  const [job, completed_count] = await Promise.all([
    task.populate('job').execPopulate(),
    CSVJobTask.count({job: task.job, completed: true, error: undefined}).exec(),
  ]);
  const prevTotal = job.average_task_completion_time * (completed_count - 1);
  job.average_task_completion_time = (prevTotal + task.duration) / completed_count;

  if (0 === (await CSVJob.count({job: job._id, completed: false}))) {
    job.completed = true;
    job.completed_timestamp = Date.now();
  }
  job.save((err) => {
    if (err) console.log(err);
    next();
  });
});
const CSVJobTask = mongoose.model('CSVJobTask', CSVJobTaskSchema);

const CSVJobSchema = new Schema({
  id: {type: String, required: true, unique: true},
  type: {
    type: String,
    required: true,
    validate: {
      validator: (v) => Object.values(JOB_TYPES).includes(v),
      message: ({value}) => `${value} is not a valid job type.`,
    },
  },
  context: {type: Schema.Types.Mixed},
  export_file_name: String,
  csv_export_fields: [String],
  tasks: [{type: Schema.Types.ObjectId, ref: 'CSVJobTask'}],
  total_tasks: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  created_timestamp: {
    type: Date,
    default: Date.now,
  },
  completed_timestamp: {
    type: Date,
  },
  time_to_complete: {type: Number},
  average_task_completion_time: {type: Number},
  last_updated_timestamp: {
    type: Date,
    default: Date.now,
  },
});
const CSVJob = mongoose.model('CSVJob', CSVJobSchema);

module.exports = {CSVJob, CSVJobTask, JOB_TYPES};
