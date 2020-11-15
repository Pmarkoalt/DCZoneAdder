const socketio = require('socket.io');

module.exports.socket = (server) => {
  // Set up Socket.io
  const io = socketio(server);
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('download-csv-job-result', async (jobId, respond) => {
      const job = await CSVJob.findOne({id: jobId}).exec();
      const keys = job.csv_export_fields.length > 0 ? job.csv_export_fields : Object.keys(job.results[0]);
      const parser = new Parser({fields: keys, excelStrings: true});
      const csv = parser.parse(job.results);
      respond(csv);
    });

    const makeKeysUpper = (obj) => {
      if (!obj) return obj;
      return Object.keys(obj).reduce((acc, key) => {
        acc[key.toUpperCase()] = obj[key];
        return acc;
      }, {});
    };

    // socket.on('download-zone-job-result', async (jobId, respond) => {
    //   const job = await Jobs.findOne({job_id: jobId}).exec();
    //   const query = {job_id: jobId, complete: true, error: false};
    //   let addresses = await Addresses.find(query).exec();
    //   addresses = addresses.map((a) => makeKeysUpper(a.data));
    //   let keys = job.csv_export_fields.length > 0 ? job.csv_export_fields : Object.keys(addresses[0]);
    //   keys = keys.map((k) => k.toUpperCase());
    //   const parser = new Parser({fields: keys, excelStrings: false});
    //   const csv = parser.parse(addresses);
    //   respond(csv);
    // });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};
