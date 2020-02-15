var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var addressesSchema = new Schema({
  job_id:  String,
  data: Schema.Types.Mixed,
  fields: [String],
  complete : {
    type: Boolean,
    default: false
  },
  error : {
    type: Boolean,
    default: false
  },
  error_details: String,
  date_created: {
    type: Date,
    default: Date.now
  },
  date_modifed: {
    type: Date,
    default: Date.now
  }
});

module.exports = addressesSchema;