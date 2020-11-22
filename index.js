require('dotenv').config();
const socketio = require('socket.io');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const {socket} = require('./socket');

const csv = require('csvtojson');
const {connectToDB} = require('./db');
const {init, listJobs, createJob, deleteJob, findJob, getJobResultCSVString, getJobResults} = require('./jobs');

connectToDB().then(async () => {
  const io = socketio(server);
  io.on('connection', (socket) => {
    console.log('User connected');
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
      if (!['zone', 'tpsc'].includes(jobType)) {
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
    return res.status(500).json({message: 'Error creating job', error: err});
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
    return res.status(500).json({message: 'Error finding job', error: err});
  }
});

app.get('/api/csv-jobs/:id/succeeded', async (req, res) => {
  const jobId = req.params.id;
  try {
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const pagination = {
      start: req.query.start ? Number(req.query.start) : 0,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };
    const tasks = await getJobResults(jobId, false, pagination);
    return res.status(200).json(tasks);
  } catch (err) {
    if (err === 404) {
      return res.status(404).json({message: `Cannot find job ${jobId}`});
    }
    return res.status(500).json({message: 'Error getting job task results', error: err});
  }
});

app.get('/api/csv-jobs/:id/failed', async (req, res) => {
  const jobId = req.params.id;
  try {
    if (!jobId) return res.status(400).json({message: 'No Job Id provided'});
    const {start = 0, limit = 10} = req.query;
    const tasks = await getJobResults(jobId, true, {start, limit});
    return res.status(200).json(tasks);
  } catch (err) {
    if (err === 404) {
      return res.status(404).json({message: `Cannot find job ${jobId}`});
    }
    return res.status(500).json({message: 'Error getting job task results', error: err});
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
    const job = await deleteJob(jobId);
    return res.status(204).json(job);
  } catch (err) {
    return res.status(500).json({message: 'Error deleting job', error: err});
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log('App is listening on port ' + port);
});
