require('dotenv').config()
const express = require('express');
const path = require('path');
const cors = require('cors');
const superagent = require('superagent');
const bodyParser = require('body-parser');
const redis = require('redis');
const client = redis.createClient();
const Queue = require('bull');
const server = require('http').createServer();
const io = require('socket.io')(server);

const csv = require('csvtojson');
const { Parser } = require('json2csv');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({trim: true});
const fs = require('fs');
const mongoose = require('mongoose');
const Schemas = require('./schemas');

// ENV Variables
const cluster_user = process.env.CLUSTER_USER;
const cluster_password = process.env.CLUSTER_PASSWORD;
const ZWSID = process.env.ZWSID;

const uses = require('./uses_master');


const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// parse application/json
app.use(bodyParser.json({limit: '50mb', extended: true}));

// Set up CORS
app.use(cors());

// Confirm Redis connected
client.on('connect', function() {
    console.log('Connected to Redis Server');
});

// // Set up Mongoose
mongoose.connect(`mongodb+srv://${cluster_user}:${cluster_password}@cluster0-dkqdm.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('connected', function(){
    console.log('Mongoose connected with DB');
});
const Jobs = mongoose.model('Jobs', Schemas.jobsSchema);
const Addresses = mongoose.model('Addresses', Schemas.addressesSchema);


// Set up CSV Queue
const csvQueue = new Queue('csv_queue', 'redis://127.0.0.1:6379');

csvQueue.process( async (task) => {
    console.log("process");
    await processAddress(task.data, task);
    const completed_items = await fetchAddress(task.data.job_id);
    const complete_job = await fetchJobStatus(task.data.job_id);
    let keys = [];
    // Find keys
    for (let i = 0 ; completed_items.length > i; i++) {
        if (completed_items[i].complete) {
            key = Object.keys(completed_items[i].data);
            break;
        }
    }
    return io.sockets.emit('csv_update', {addresses: completed_items, job_complete: complete_job, keys: keys});
});

csvQueue.on('error', (error) => {
    console.log(error);
})

csvQueue.on('completed', (job, result) => {
    console.log('job complete', job.id);
});

// Set up Socket.io
io.on('connection', socket => {
    console.log('User connected')
    
    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
});
server.listen(3001);

// Functions
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

function normalizeObject(obj) {
    let key, keys = Object.keys(obj);
    let n = keys.length;
    const newobj = {}
    while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = obj[key];
    }
    return newobj;
}

function cleanData(data){
    // Removing unneccessary data
    delete data['address_url'];
    delete data['data_url'];
    delete data['x_coord'];
    delete data['y_coord'];
    delete data['zillowPropsURL'];
    if (data['Use Code']) {
        const match = uses.find((use) => {
            return data['Use Code'] === use.code;
        })
        if (match) {
            // Deleting and adding use code to end 
            const code = data['Use Code']
            delete data['Use Code'];
            data['Use Code'] = code;
            data['Use Title'] = `${match.name} ${match.class}`;
            data['Use Description'] = match.description;
        }
    }
    return data
}

function arrToHash(array) {
    const hash = {};
    array.forEach(item => {
        hash[item] = true;
    });
    return hash;
}

function checkRes(response) {
    if (response.ok) {
        return Promise.resolve(response.body);
    } else {
        if (response.error && response.error.text) {
            return Promise.reject(response.error.text);
        } else {
            return Promise.reject("Unknown DC Gov API Error");
        }
    }
}

function checkPropData(response) {
    if (response.returnDataset && response.returnDataset.Table1.length) {
        return Promise.resolve(response);
    } else {
        if (response.returnCDDataSet && response.returnCDDataSet['Address Return Codes'].length) {
            let errors = [];
            response.returnCDDataSet['Address Return Codes'].forEach(code => {
                if (code.Assessment !== "Valid") {
                    errors.push(code);
                }
            });
            return Promise.reject(errors)
        } else {
            return Promise.reject({Assessment: "Unknown Address Error"});
        }
    }
}
function parsePropData(response) {
    if (response.returnDataset && response.returnDataset.Table1.length) {
        const returnData = response.returnDataset.Table1[0];
        // More data be pulled from this response, but this is the only useful data
        // The X and Y Coordinate (NOT LAT LONG) is crucial for finding zoning data
        const returnObj = {
            "Full Address": returnData.FULLADDRESS,
            "Street View URL": returnData.STREETVIEWURL,
            "State": returnData.STATE,
            "City": returnData.CITY,
            "Zip Code": returnData.ZIPCODE,
            "Confidence Level": returnData.ConfidenceLevel,
            "x_coord": returnData.XCOORD,
            "y_coord": returnData.YCOORD
        }
        return Promise.resolve(returnObj);
    } else {
        return Promise.reject({Assessment: "Unknown Parsing Address Error"});
    }
}
function checkAddData(response) {
    if (response.results.length) {
        return Promise.resolve(response);
    } else {
        return Promise.reject("No Available Zoning Data");
    }
}
function parseAddData(response) {
    if (response.results.length) {
        const returnObj = {};
        response.results.forEach(result => {
            switch (result.layerId) {
                case 25:
                    returnObj['Zone Description'] = result.attributes.Zone_Description && result.attributes.Zone_Description !== 'Null' ? result.attributes.Zone_Description : 'Unavailable';
                    returnObj['Zone'] = result.attributes.ZONING && result.attributes.ZONING !== 'Null' ? result.attributes.ZONING : 'Unavailable';
                    break;
                case 11:
                    returnObj['Owner Name'] = result.attributes.OWNERNAME && result.attributes.OWNERNAME !== 'Null' ? result.attributes.OWNERNAME : 'Unavailable';
                    returnObj['Owner Address'] = result.attributes.ADDRESS1 && result.attributes.ADDRESS1 !== 'Null' ? result.attributes.ADDRESS1 : 'Unavailable';
                    returnObj['Owner City Zip'] = result.attributes.CITYSTZIP && result.attributes.CITYSTZIP !== 'Null' ? result.attributes.CITYSTZIP : 'Unavailable';
                    returnObj['Use Code'] = result.attributes.USECODE && result.attributes.USECODE !== 'Null' ? result.attributes.USECODE : 'Unavailable';
                    returnObj['Sale Price'] = result.attributes.SALEPRICE && result.attributes.SALEPRICE  !== 'Null' ? `$${result.attributes.SALEPRICE}` : 'Unavailable';
                    returnObj['Sale Date'] = result.attributes.SALEDATE && result.attributes.SALEDATE !== 'Null' ? result.attributes.SALEDATE : 'Unavailable';
                    returnObj['Current Price (Land)'] = result.attributes.PHASELAND && result.attributes.PHASELAND !== 'Null' ? `$${result.attributes.PHASELAND}` : 'Unavailable' ;
                    returnObj['Current Price (Improvements)'] = result.attributes.PHASEBUILD && result.attributes.PHASEBUILD !== 'Null' ? `$${result.attributes.PHASEBUILD}` : 'Unavailable';
                    returnObj['Current Price (Total)'] = result.attributes.ASSESSMENT && result.attributes.ASSESSMENT !== 'Null' ? `$${result.attributes.ASSESSMENT}` : 'Unavailable';
                    returnObj['Proposed Price (Land)'] = result.attributes.NEWLAND && result.attributes.NEWLAND !== 'Null' ? `$${result.attributes.NEWLAND}` : 'Unavailable';
                    returnObj['Proposed Price (Improvements)'] = result.attributes.NEWIMPR && result.attributes.NEWIMPR !== 'Null' ? `$${result.attributes.NEWIMPR}` : 'Unavailable';
                    returnObj['Proposed Price (Total)'] = result.attributes.NEWTOTAL && result.attributes.NEWTOTAL !== 'Null' ? `$${result.attributes.NEWTOTAL}` : 'Unavailable';
                    break;
                default:
                    break;
            }
        });
        return Promise.resolve(returnObj);
    } else {
        return Promise.reject("Unknown Parsing Zoning Data Error");
    }
}
function checkZillowData(data) {
    if (data.ok) {
        return Promise.resolve(data.res);
    } else {
        return Promise.reject("Error with Zillow API");
    }
}
function xmltoJSON(response) {
        return parser.parseStringPromise(response.text).then(function (result) {
            const parse_json = result["SearchResults:searchresults"].response ?
                result["SearchResults:searchresults"].response[0].results[0].result[0] : undefined;
            if (parse_json === undefined) return Promise.reject("No data found");
            return Promise.resolve(parse_json);
          })
          .catch(function (err) {
            console.log('line 210')
            console.log(err);
            return Promise.reject(err);
          });
}

function parseZillowData(data) {
    if (data) { 
        const returnObj = {
            "Zestimate": data.zestimate[0].amount[0]._ ? `$${data.zestimate[0].amount[0]._}` : 'Unavailable',
            "Zestimate Last Update": data.zestimate[0]["last-updated"][0] ? data.zestimate[0]["last-updated"][0] : "Unavailable",
            "Zestimate (High)": data.zestimate[0].valuationRange[0].high[0]._ ? `$${data.zestimate[0].valuationRange[0].high[0]._}` : "Unavailable",
            "Zestimate (Low)": data.zestimate[0].valuationRange[0].low[0]._ ? `$${data.zestimate[0].valuationRange[0].low[0]._}` : "Unavailable",
        }
        return Promise.resolve(returnObj);
    } else {
        return Promise.reject({Assessment: "Unknown Parsing Zillow Error"});
    }
}

function processAddress(item, task) {
    const basePropURL = 'https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2?str=';
    const baseDataURL1 = 'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/PropertyQuest/MapServer/identify?f=json&tolerance=1&';
    const baseDataURL2 = 'returnGeometry=false&imageDisplay=100%2C100%2C96&geometryType=esriGeometryPoint&sr=26985&mapExtent=400713.2%2C136977.93%2C400715.2%2C136979.93&layers=all%3A25%2C11%2C';
    const prop = normalizeObject(item.data);

    return new Promise((resolve, reject) =>{
        if (prop.street) {
            prop.address_url = `${basePropURL}${encodeURI(prop.street)}&f=json`;
        } else if (prop.address) {
            prop.address_url = `${basePropURL}${encodeURI(prop.address)}&f=json`
        } else {
            reject({message: "no valid address"});
        }
        
        return superagent.get(prop.address_url)
            .then(checkRes)
            .then(checkPropData)
            .then(parsePropData)
            .then((response) => {
                task.progress(33);
                return resolve({
                    ...prop,
                    ...response
                });
            })
            .catch((err) => {
                console.log(err);
                return reject({message: "Problem finding address in DC Gov database", prop});
            })
    }).then((prop) => {
        prop.data_url = `${baseDataURL1}geometry=%7B%22x%22%3A${prop.x_coord}%2C%22y%22%3A${prop.y_coord}%7D${baseDataURL2}`;
        return superagent.get(prop.data_url)
        .then(checkRes)
        .then(checkAddData)
        .then(parseAddData)
        .then((response) => {
            task.progress(66);
            return Promise.resolve({
                ...prop,
                ...response
            });
        })
        .catch((err) => {
            console.log(err);
            return Promise.reject({message: "Problem finding tax information in DC Gov database", prop});
        });
    }).then((prop) => {
        prop.searchZillow = true;
        if (prop.searchZillow) {
            const address = encodeURI(prop["Full Address"]);
            const cityStateZip = `${prop["City"]} ${prop["State"]} ${prop["Zip Code"]}`;
            prop.zillowPropsURL = `http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=${ZWSID}&address=${address}&citystatezip=${cityStateZip}`;
            return superagent.get(prop.zillowPropsURL)
            .then(checkZillowData)
            .then(xmltoJSON)
            .then(parseZillowData)
            .then((response) => {
                task.progress(90);
                return Promise.resolve({
                    ...prop,
                    ...response
                });
            })
            .catch((err) => {
                console.log(err);
                return Promise.reject({message: "Problem communicating with Zillow", prop});
            });
        } else {
            return Promise.resolve(prop);
        }
    }).then((prop) => {
        const final_data = cleanData(prop);
        // console.log(final_data);
        // console.log("fifth", task.id);
        // console.log
        return Addresses.findOneAndUpdate(
            {_id: item._id}, 
            { 
                $set: {
                    data: final_data,
                    complete: true,
                    date_modifed: new Date()
                }
            },
            {new: true, useFindAndModify: true},
            (err, address) => {
                if (err) console.log(err);
                return Jobs.findOneAndUpdate(
                    { job_id: item.job_id }, 
                    {
                        $inc: {
                            completed_items: 1
                        }, 
                        $set: {
                            date_modifed: new Date()
                        }
                    },
                    { new: true, useFindAndModify: true },
                    (err, job) => {
                        if (err) console.log(err);
                        Promise.resolve(prop);
                    });
            });
    }).then((prop) => {
        return Promise.resolve(prop);
    }).catch((prop) => {
        // Overwriting prop object and storing error in external variable
        const error = prop.message;
        prop = prop.prop;
        const final_data = cleanData(prop);
        return Addresses.findOneAndUpdate(
            {_id: item._id}, 
            { 
                $set: {
                    data: final_data,
                    error: true,
                    error_details: error,
                    date_modifed: new Date()
                }   
            },
            {new: true, useFindAndModify: true},
            (err, address) => {
                return Jobs.findOneAndUpdate(
                    {job_id: item.job_id},
                    {
                        $inc: {
                            failed_items: 1
                        }, 
                        $set: {
                            date_modifed: new Date()
                        }
                    },
                    {new: true, useFindAndModify: true},
                    (err, job) => {
                        task.progress(100);
                        return Promise.resolve(prop);
                    });
            });
    });
}

async function fetchAddress(job_id) {
    return new Promise((resolve, reject) => {
        return Addresses.find(
            {job_id, complete: true}, 
            (err, docs) => {
                if (err) console.log(err);
                const returnArray = docs.map(item => {
                    return item.data;
                });
                return resolve(returnArray);
            }
        )
    })
}

async function fetchJobStatus(job_id) {
    return new Promise((resolve, reject) => {
        return Jobs.findOne(
            {job_id},
            (err, doc) => {
                if (err) console.log(err);
                const job = doc.toObject();
                
                // Update if job is complete
                if (
                    job.completed_items + job.failed_items === job.total_items &&
                    job.completed === false
                ) {
                    return Jobs.findOneAndUpdate(
                        {job_id},
                        {
                            $set: {
                                complete: true,
                            }
                        },
                        (err, doc) => {
                            if (err) console.log(err);
                            return resolve(true)
                        }
                    )
                } else if (
                    job.completed_items + job.failed_items === job.total_items &&
                    job.completed === false
                ) {
                    return resolve(true)
                } else {
                    return resolve(false)
                }
            }
        )
    }) 
}

// End Points
app.post('/api/processCsv', (req, res) => {
    // Creating Job ID
    const job_id = uuidv4();
    // Creating Job
    const job = new Jobs({
        job_id,
        total_items: req.body.csv_array.length,
        zone_filters: arrToHash(req.body.filter.zones),
        use_filters: arrToHash(req.body.filter.use)
    });
    job.save((err, job) => {
        if (err) return res.status(500).json({message: "Problem creating job"});
        // Assigning Job ID to every item in array
        const csv_array = req.body.csv_array.map((el) => {
            const o = Object.assign({}, el);
            o.job_id = job_id;
            o.data = el;
            return o;
        });
        Addresses.create(csv_array, (err, csvs) => {
            if (err) return res.status(500).json({message: "Problem creating addresses"});
            for (let i = 0; i < csvs.length; i++) {
                csvQueue.add(csvs[i]);
            }
            return res.json({job_id: job_id});
        });
    });
});

app.post('/api/downloadCsv', (req, res) => {
    const keys = Object.keys(req.body);
    const json2csvParser = new Parser({keys});
    const csv = json2csvParser.parse(req.body);
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.set('Content-Type', 'text/csv');
    return res.status(200).send(csv);
});

app.post('/api/downloadCsv/:id', (req, res) => {
    return res.json({message: 'Download'});
});

app.post('/api/saveCsv', (req, res) => {
    return res.json({message: 'Save Complete'});
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);