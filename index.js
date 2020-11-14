require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const csv = require('csvtojson');
const {connectToDB} = require('./db');
const {init, listJobs, createJob, deleteJob, findJob, getJobResultCSVString} = require('./jobs');

connectToDB().then(init);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

// parse application/json
app.use(bodyParser.json({limit: '50mb', extended: true}));

// Set up CORS
app.use(cors());

// End Points
app.get('/api/csv-jobs', async (req, res) => {
  try {
    const jobs = await listJobs();
    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({message: 'Problem with Mongo DB'});
  }
});

app.post('/api/csv-jobs', async (req, res) => {
  try {
    const job = await createJob(req.body);
    return res.status(201).json(job);
  } catch (err) {
    return res.status(500).json({message: 'Error creating job', error: err});
  }
});

app.get('/api/csv-jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const job = await findJob(jobId);
    return res.json(job);
  } catch (err) {
    return res.status(500).json({message: 'Error finding job', error: err});
  }
});

app.get('/api/csv-jobs/:id/download', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const csv = await getJobResultCSVString(jobId);
    res.set('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({message: 'Error download job results', error: err});
  }
});

app.delete('/api/csv-jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    await deleteJob(jobId);
    return res.status(204).json();
  } catch (err) {
    return res.status(500).json({message: 'Error deleting job', error: err});
  }
});

// app.post('/api/processCsv', (req, res) => {
//   // Creating Job ID
//   const job_id = generateId();
//   let csv_array = splitAddressDash(req.body.csv_array);

//   // Creating Job
//   const job = new Jobs({
//     job_id,
//     total_items: csv_array.length,
//     zone_filters: arrToHash(req.body.filter.zones),
//     use_filters: arrToHash(req.body.filter.use),
//     export_file_name: req.body.export_file_name,
//     csv_export_fields: req.body.csv_export_fields,
//   });
//   job.save((err, job) => {
//     if (err) return res.status(500).json({message: 'Problem creating job'});

//     // Assigning Job ID to every item in array
//     csv_array = csv_array.map((el) => {
//       const o = Object.assign({}, el);
//       o.job_id = job_id;
//       o.data = el;
//       o.fields = req.body.csv_export_fields;
//       return o;
//     });

//     Addresses.create(csv_array, (err, csvs) => {
//       if (err) return res.status(500).json({message: 'Problem creating addresses'});
//       for (let i = 0; i < csvs.length; i++) {
//         zoneQueue.add({id: csvs[i]._id, search_zillow: req.body.search_zillow, type: TASK_TYPES.ZONE});
//       }
//       return res.json({job_id: job_id});
//     });
//   });
// });

// app.post('/api/downloadCsv', (req, res) => {
//   const keys = Object.keys(req.body);
//   const json2csvParser = new Parser({keys});
//   const csv = json2csvParser.parse(req.body);
//   res.setHeader('Content-disposition', 'attachment; filename=data.csv');
//   res.set('Content-Type', 'text/csv');
//   return res.status(200).send(csv);
// });

// app.get('/api/downloadCsvById/:id', async (req, res) => {
//   return Addresses.findOne({job_id: req.params.id}, (err, doc) => {
//     if (err) return res.status(500).send({message: 'problem with Mongo'});
//     const doc_object = doc.toObject();
//     const {fields = []} = doc_object;
//     const address = doc_object.data;
//     let keys = fields.length > 0 ? fields : Object.keys(address);
//     let final_keys = keys.map(toTitleCase);
//     const json2csvParser = new Parser({fields: final_keys});
//     const csv = json2csvParser.parse(address);
//     res.setHeader('Content-disposition', 'attachment; filename=data.csv');
//     res.set('Content-Type', 'text/csv');
//     return res.status(200).send(csv);
//   });
// });

// app.post('/api/saveCsv', (req, res) => {
//   return res.json({message: 'Save Complete'});
// });

// app.get('/api/addressByJobId/:id', async (req, res) => {
//   const job_id = req.params.id;
//   console.log(job_id);
//   if (!job_id) return res.status(400).json({message: 'No Job Id provided'});
//   const return_data = await fetchCurrentJob(job_id);
//   return res.json(return_data);
// });

// app.get('/api/jobs/:id', async (req, res) => {
//   const job_id = req.params.id;
//   if (!job_id) return res.status(400).json({message: 'No Job Id provided'});
//   try {
//     const job = await Jobs.findOne({job_id}).exec();
//     if (!job) return res.status(404).json({message: 'Job not found'});
//     return res.json(job);
//   } catch (e) {
//     return res.status(500).json({message: e});
//   }
// });

// app.get('/api/jobs/:id/completed', async (req, res) => {
//   const jobId = req.params.id;
//   try {
//     const count = await Addresses.countDocuments({job_id: jobId, $or: [{complete: true}, {error: true}]}).exec();
//     return res.status(200).json({count});
//   } catch (err) {
//     return res.status(500).json({message: e});
//   }
// });

// app.delete('/api/jobs/:id', async (req, res) => {
//   const job_id = req.params.id;
//   console.log(job_id);
//   if (!job_id) return res.status(400).json({message: 'No Job Id provided'});
//   const job = await Jobs.deleteOne({job_id}).exec();
//   const address = await Addresses.deleteMany({job_id}).exec();
//   return res.json({job, address});
// });

// app.get('/api/findAllJobs', (req, res) => {
//   Jobs.find({}, (err, jobs) => {
//     if (err) return res.status(500).json({message: 'Problem with Mongo DB'});
//     return res.json({jobs: jobs});
//   });
// });

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log('App is listening on port ' + port);
});
