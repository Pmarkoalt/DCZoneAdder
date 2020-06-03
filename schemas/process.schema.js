var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var processSchema = new Schema({
  type: String,
  job_id: String,
  entity_id:  String,
  result: Object,
  error: String,
  last_ran: {
    type: Date,
    default: Date.now,
  }
});

module.exports = processSchema;