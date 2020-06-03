var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CSVJobSchema = new Schema({
  id: String,
  type: String,
  export_file_name: String,
  csv_export_fields: [String],
  results: [Schema.Types.Mixed],
  total_items: {
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
  last_updated: {
    type: Date,
    default: Date.now
  },
});

module.exports = CSVJobSchema;