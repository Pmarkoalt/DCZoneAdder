var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var addressesSchema = new Schema({
  job_id:  {type: String, index: true},
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

addressesSchema.index({job_id: 'hashed'});
addressesSchema.index({job_id: 'hashed', complete: 1});

module.exports = addressesSchema;