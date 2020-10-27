require('dotenv').config()
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const cors = require('cors');
const superagent = require('superagent');
const bodyParser = require('body-parser');
// const redis = require('redis');
// const url = require('url');
// const redisURL = url.parse(process.env.REDISCLOUD_URL);
// const client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
// client.auth(redisURL.auth.split(":")[1]);

// Method for testing purposes to clean Redis Collection
// client.flushdb( function (err, succeeded) {
//     if (err) return console.log(err);
//     console.log("Success",succeeded); // will be true if successfull
// });
// console.log(process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_PASSWORD);
const Queue = require('bull');

const csv = require('csvtojson');
const { Parser } = require('json2csv');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({trim: true});
const fs = require('fs');
const mongoose = require('mongoose');
const Schemas = require('./schemas');
const {processProperty, getSSL} = require('./scraper.js');

// ENV Variables
const cluster_user = process.env.CLUSTER_USER;
const cluster_password = process.env.CLUSTER_PASSWORD;
const ZWSID = process.env.ZWSID;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const uses = require('./uses_master');

mongoose.connect(`mongodb+srv://${cluster_user}:${cluster_password}@cluster0-dkqdm.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('connected', function(){
    console.log('Mongoose connected with DB');
});
const Jobs = mongoose.model('Jobs', Schemas.jobsSchema);
const Addresses = mongoose.model('Addresses', Schemas.addressesSchema);
const CSVJob = mongoose.model('CSVJob', Schemas.CSVJobSchema);

console.log("Running commands...");

async function getQueueCount() {
    console.log("Setting up queue");
    const csvQueue = new Queue('csv_queue', REDIS_URL);
    console.log("Queue set up");
    const count = await csvQueue.count();
    console.log("Queue count", count);
}

async function resetQueue () {
    const csvQueue = new Queue('csv_queue', REDIS_URL);
    console.log("Before count", await csvQueue.count());
    csvQueue.clean(3600 * 1000, "completed");
    csvQueue.clean(1000, "wait");
    csvQueue.clean(1000, "active");
    csvQueue.clean(1000, "delayed");
    setTimeout(async () => {
        console.log("After count", await csvQueue.count());
        mongoose.disconnect();
        console.log("done");
    }, 5000);
}

async function getJobInfo(jobId) {
    try {
        const result = await Jobs.findOne({job_id: jobId}).exec();
        console.log(result);
    } catch (e) {
        console.log("SHIT", e);
    }
    try {
        const addresses = await Addresses.find({job_id: jobId, complete: true}).exec();
        console.log("addresses", addresses);
    } catch (e) {
        console.log("SHIT", e);
    }
    mongoose.disconnect();
}
// getJobInfo("m8J3pbwS");
getQueueCount();
// resetQueue();

// Insert Ad-hoc commands here
// // const jobId = "nw0ZTCjx";
// const jobId = "sSYZ0ggQ";
// (async () => {
//     try {
//         const count = await Addresses.countDocuments({job_id: jobId, complete: true}).exec();
//         console.log("Count", count);
//     } catch (e) {
//         console.log("SHIT", e);
//     }

//     try {
//         const result = await Jobs.findOne({job_id: jobId}).exec();
//         console.log("FOUND IT", result);
//     } catch (e) {
//         console.log("SHIT", e);
//     }

//     try {
//         const addresses = await Addresses.find({job_id: jobId, complete: true}).exec();
//         console.log("addresses", addresses);
//     } catch (e) {
//         console.log("SHIT", e);
//     }
//     mongoose.disconnect();
// })();