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

    socket.on(
      'create-zone-job',
      async ({csvArray, zones, use, exportFileName, csvExportFields, searchZillow}, respond) => {
        // Creating Job ID
        const job_id = generateId();
        console.log(`Attempting to creat job: ${job_id}`);
        let csv_array = splitAddressDash(csvArray);

        // Creating Job
        const job = new Jobs({
          job_id,
          total_items: csv_array.length,
          zone_filters: arrToHash(zones),
          use_filters: arrToHash(use),
          export_file_name: exportFileName,
          csv_export_fields: csvExportFields,
        });
        job.save((err, job) => {
          if (err) return respond({error: 'Problem creating job'});

          // Assigning Job ID to every item in array
          csv_array = csv_array.map((el) => {
            const o = Object.assign({}, el);
            o.job_id = job_id;
            o.data = el;
            o.fields = csvExportFields;
            return o;
          });

          Addresses.create(csv_array, (err, csvs) => {
            if (err) return respond({error: 'Problem creating addresses'});
            for (let i = 0; i < csvs.length; i++) {
              zoneQueue.add({id: csvs[i]._id, search_zillow: searchZillow, type: TASK_TYPES.ZONE});
            }
            return respond({jobId: job_id});
          });
        });
      },
    );

    const makeKeysUpper = (obj) => {
      if (!obj) return obj;
      return Object.keys(obj).reduce((acc, key) => {
        acc[key.toUpperCase()] = obj[key];
        return acc;
      }, {});
    };

    socket.on('download-zone-job-result', async (jobId, respond) => {
      const job = await Jobs.findOne({job_id: jobId}).exec();
      const query = {job_id: jobId, complete: true, error: false};
      let addresses = await Addresses.find(query).exec();
      addresses = addresses.map((a) => makeKeysUpper(a.data));
      let keys = job.csv_export_fields.length > 0 ? job.csv_export_fields : Object.keys(addresses[0]);
      keys = keys.map((k) => k.toUpperCase());
      const parser = new Parser({fields: keys, excelStrings: false});
      const csv = parser.parse(addresses);
      respond(csv);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};
