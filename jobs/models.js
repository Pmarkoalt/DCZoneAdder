var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const JOB_TYPES = {
  TPSC: 'tpsc',
  ZONE: 'zone',
  BELLES: 'belles',
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
CSVJobTaskSchema.pre('save', async (next) => {
  if (this.completed && !this.end_time) {
    this.end_time = Date.now();
    this.duration = this.end_time - this.start_time.getTime();
  }
  next();
});
CSVJobTaskSchema.post('save', async (task) => {
  if (!task.completed || task.error) return;
  const [{job}, completed_count] = await Promise.all([
    task.populate('job').execPopulate(),
    CSVJobTask.count({job: task.job, completed: true, error: undefined}).exec(),
  ]);
  const prevTotal = (job.average_task_completion_time || 0) * (completed_count - 1);
  job.average_task_completion_time = (prevTotal + task.duration) / completed_count;

  const completedCount = await CSVJobTask.count({job: job._id, completed: false});
  if (completedCount === 0 && !job.completed) {
    job.completed = true;
  }
  job.save((err) => {
    if (err) console.log(err);
  });
});

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
CSVJobSchema.post('save', async (job) => {
  if (job.completed && !job.completed_timestamp) {
    job.completed_timestamp = Date.now();
    job.time_to_complete = job.completed_timestamp - job.created_timestamp.getTime();
    job.save();
  }
});

const CSVJobTask = mongoose.model('CSVJobTask', CSVJobTaskSchema);
const CSVJob = mongoose.model('CSVJob', CSVJobSchema);

module.exports = {CSVJob, CSVJobTask, JOB_TYPES};
