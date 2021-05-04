require('dotenv').config();
const socketio = require('socket.io');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
// const {socket} = require('./socket');

// const csv = require('csvtojson');
const {connectToDB} = require('./db');
const {
  JOB_TYPES,
  init,
  listJobs,
  createJob,
  deleteJob,
  findJob,
  getJobResultCSVString,
  getJobInputCSVString,
  getJobFailedResultsCSVString,
  getJobLeadResultsZip,
  getJobResults,
} = require('./jobs');
const {getODDCData} = require('./jobs/open-data-dc');

connectToDB().then(async () => {
  const io = socketio(server);
  io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('create-csv-job', async (data, resp) => {
      console.log('Creating job');
      try {
        const job = await createJob(data);
        resp({data: job});
      } catch (e) {
        resp({error: e});
      }
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  const onSuccess = (task) => {
    io.emit(`job-task-complete-${task.jobId}`);
  };
  init({onSuccess});
});

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
    const {jobType} = req.query;
    if (jobType) {
      if (!Object.values(JOB_TYPES).includes(jobType)) {
        return res.status(400).json({message: `${jobType} is not a valid job type.`});
      }
    }
    const jobs = await listJobs(req.query.jobType);
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
    return res.status(500).json({message: 'Error creating job', error: err.toString()});
  }
});

app.get('/api/csv-jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const job = await findJob(jobId);
    return res.json(job);
  } catch (err) {
    if (err === 404) {
      return res.status(404).json({message: `Cannot find job ${jobId}`});
    }
    return res.status(500).json({message: 'Error finding job', error: err.toString()});
  }
});

app.get('/api/open-data', async (req, res) => {
  const {ssl, address} = req.query;
  try {
    if (!ssl && !address) return res.status(400).json({message: 'ssl or address is required'});
    const data = await getODDCData(ssl, address);
    res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({message: 'Error processing property.', error: err.toString()});
  }
});

app.get('/api/csv-jobs/:id/succeeded', async (req, res) => {
  const jobId = req.params.id;
  try {
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const pagination = {
      start: req.query.start ? Number(req.query.start) : 0,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const tasks = await getJobResults(jobId, false, pagination);
    return res.status(200).json(tasks);
  } catch (err) {
    if (err === 404) {
      return res.status(404).json({message: `Cannot find job ${jobId}`});
    }
    return res.status(500).json({message: 'Error getting job task results', error: err.toString()});
  }
});

app.get('/api/csv-jobs/:id/failed', async (req, res) => {
  const jobId = req.params.id;
  try {
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const pagination = {
      start: req.query.start ? Number(req.query.start) : 0,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const tasks = await getJobResults(jobId, true, pagination);
    return res.status(200).json(tasks);
  } catch (err) {
    if (err === 404) {
      return res.status(404).json({message: `Cannot find job ${jobId}`});
    }
    return res.status(500).json({message: 'Error getting job task results', error: err.toString()});
  }
});

app.get('/api/csv-jobs/:id/failed/csv', async (req, res) => {
  const jobId = req.params.id;
  try {
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const csv = await getJobFailedResultsCSVString(jobId);
    res.set('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    return res.status(200).send(csv);
  } catch (err) {
    if (err === 404) {
      return res.status(404).json({message: `Cannot find job ${jobId}`});
    }
    return res.status(500).json({message: 'Error creating job failed task csv', error: err.toString()});
  }
});

app.get('/api/csv-jobs/:id/download', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const useFilter = Boolean(req.query.useFilter);
    const csv = await getJobResultCSVString(jobId, useFilter);
    res.set('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({message: 'Error download job results', error: err.toString()});
  }
});

app.get('/api/csv-jobs/:id/input-file', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const csv = await getJobInputCSVString(jobId);
    res.set('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({message: "Error generating job's CSV input file.", error: err});
  }
});

app.get('/api/csv-jobs/:id/leads', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const leadResultsZipBuffer = await getJobLeadResultsZip(jobId);
    res.set('Content-Type', 'application/zip');
    res.setHeader('Content-disposition', 'attachment; filename=leads.zip');
    // return res.status(200);
    return res.status(200).send(leadResultsZipBuffer);
  } catch (err) {
    return res.status(500).json({message: "Error generating job's CSV input file.", error: err});
  }
});

app.delete('/api/csv-jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const job = await deleteJob(jobId);
    return res.status(204).json(job);
  } catch (err) {
    return res.status(500).json({message: 'Error deleting job', error: err.toString()});
  }
});

app.post('/api/auth', async (req, res) => {
  try {
    const password = req.body.password;
    const status = password === process.env.APP_PASSWORD ? 200 : 401;
    res.sendStatus(status);
  } catch (err) {
    return res.status(500).json({message: 'Error authenticating'});
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 80;
server.listen(port, () => {
  console.log('App is listening on port ' + port);
});
