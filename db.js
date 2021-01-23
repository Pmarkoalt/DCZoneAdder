const mongoose = require('mongoose');

module.exports.connectToDB = () => {
  return new Promise((resolve, reject) => {
    try {
      mongoose.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
      mongoose.connection.on('connected', function () {
        console.log('Mongoose connected with DB');
        resolve(mongoose);
      });
    } catch (err) {
      reject(err);
    }
  });
};
