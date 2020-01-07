var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobsSchema = new Schema({
  job_id:  String,
  total_items: {
    type: Number,
    default: 0
  },
  completed_items: {
    type: Number,
    default: 0
  },
  failed_items : {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  date_created: {
    type: Date,
    default: Date.now
  },
  date_modifed: {
    type: Date,
    default: Date.now
  },
  zone_filters: Schema.Types.Mixed,
  use_filters: Schema.Types.Mixed
});

module.exports = jobsSchema;