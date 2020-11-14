const mongoose = require('mongoose');
// const Schemas = require('./schemas');

// // Set up Mongoose
// const Jobs = mongoose.model('Jobs', Schemas.jobsSchema);
// const Addresses = mongoose.model('Addresses', Schemas.addressesSchema);
// const CSVJob = mongoose.model('CSVJob', Schemas.CSVJobSchema);

// module.exports.models = {Jobs, Addresses, CSVJob};

module.exports.connectToDB = () => {
  return new Promise((resolve, reject) => {
    try {
      mongoose.connect(process.env.TEST_MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
      mongoose.connection.on('connected', function () {
        console.log('Mongoose connected with DB');
        resolve(mongoose);
      });
    } catch (err) {
      reject(err);
    }
  });
};
