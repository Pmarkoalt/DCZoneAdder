require('dotenv').config()
const express = require('express');
const path = require('path');
const cors = require('cors');
const superagent = require('superagent');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const { Parser } = require('json2csv');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({trim: true});
const fs = require('fs');

// const mongoose = require('mongoose');

const user = process.env.USER;
const mongo_user = process.env.MONGO_USER;
const password = process.env.PASSWORD;
const ZWSID = process.env.ZWSID;

const uses = require('./uses_master');


const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Set up CORS
app.use(cors());

// // Set up Mongoose
// mongoose.connect('mongodb+srv://Pmarkoalt:Balearic@cluster0-3njbk.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

// Functions
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

function cleanData(data, filter){
    // Removing unneccessary data
    return data.map(prop => {
        delete prop['address_url'];
        delete prop['data_url'];
        delete prop['x_coord'];
        delete prop['y_coord'];
        delete prop['zillowPropsURL'];
        if (prop['Use Code']) {
            const match = uses.find((use) => {
                return prop['Use Code'] === use.code;
            })
            if (match) {
                // Deleting and adding use code to end 
                const code = prop['Use Code']
                delete prop['Use Code'];
                prop['Use Code'] = code;
                prop['Use Title'] = `${match.name} ${match.class}`;
                prop['Use Description'] = match.description;
            }
        }
        return prop
    }).filter(prop => {
        // Check for Filter
        if (!filter.zones && !filter.use) {
            return true;
        }
        // Secondary Filter Check
        if  (
            (!Object.keys(filter.zones).length || filter.zones['ALL-ZONES'])
            && !Object.keys(filter.use).length){
            return true;
        }
        // See if current result has zone listed in the filter object
        if (Object.keys(filter.zones).length && !filter.zones[prop['Zone']] && !filter.zones['ALL-ZONES']) {
            return false;
        }
        // See if current result has zone listed in Use Object
        if (Object.keys(filter.use).length && !filter.use[prop['Use Code']]) {
            return false;
        }
        // If everything passes return object
        return true;
    });
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
            const parse_json = result["SearchResults:searchresults"].response[0].results[0].result[0];
            return Promise.resolve(parse_json);
          })
          .catch(function (err) {
            console.err(err);
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

// End Points
app.post('/api/processCsv', (req, res) => {
    // Establish variables
    const zone_filter = arrToHash(req.body.filter.zones);
    const use_filter = arrToHash(req.body.filter.use);
    const properties = [];
    const basePropURL = 'https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2?str=';
    const baseDataURL1 = 'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/PropertyQuest/MapServer/identify?f=json&tolerance=1&';
    const baseDataURL2 = 'returnGeometry=false&imageDisplay=100%2C100%2C96&geometryType=esriGeometryPoint&sr=26985&mapExtent=400713.2%2C136977.93%2C400715.2%2C136979.93&layers=all%3A25%2C11%2C';
    req.body.csv_array.forEach((property) => {
        // Normalize Object
        const normProp = normalizeObject(property);
        if (normProp.street) {
            properties.push({
                ...property,
                address_url: `${basePropURL}${encodeURI(normProp.street)}&f=json`
            });
        } else if (normProp.address) {
            properties.push({
                ...property,
                address_url: `${basePropURL}${encodeURI(normProp.address)}&f=json`
            });
        }
    });
    // Pull all property data
    Promise.all(properties.map(prop =>
        superagent.get(prop.address_url)
            .then(checkRes)
            .then(checkPropData)
            .then(parsePropData)
            .then((response) => {
                return Promise.resolve({
                    ...prop,
                    ...response
                });
            })
            .catch((err) => {
                console.log(err);
                return Promise.resolve({
                    ...prop,
                    errors: err
                });
            })
    ))
    .then(propData => {
        console.log('second')
        propData.forEach(prop => {
            if (!prop.errors) {
                prop.data_url = `${baseDataURL1}geometry=%7B%22x%22%3A${prop.x_coord}%2C%22y%22%3A${prop.y_coord}%7D${baseDataURL2}`
            }
        });
        Promise.all(propData.map(prop => {
            console.log('third');
            if (prop.data_url) {
                return superagent.get(prop.data_url)
                    .then(checkRes)
                    .then(checkAddData)
                    .then(parseAddData)
                    .then((response) => {
                        return Promise.resolve({
                            ...prop,
                            ...response
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        return Promise.resolve({
                            ...prop,
                            errors: err
                        });
                    });
            } else {
                return Promise.resolve(prop);
            }
        })).then(propData2 => {
            console.log('forth');
            // Zillow Queries
            propData2.forEach(prop => {
                if (!prop.errors) {
                    const address = encodeURI(prop["Full Address"]);
                    const cityStateZip = `${prop["City"]} ${prop["State"]} ${prop["Zip Code"]}`;
                    prop.zillowPropsURL = `http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=${ZWSID}&address=${address}&citystatezip=${cityStateZip}`;
                }
            });
            Promise.all(propData2.map(prop => {
                if (prop.zillowPropsURL) {
                    return superagent.get(prop.zillowPropsURL)
                        .then(checkZillowData)
                        .then(xmltoJSON)
                        .then(parseZillowData)
                        .then((response) => {
                            return Promise.resolve({
                                ...prop,
                                ...response
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            return Promise.resolve({
                                ...prop,
                                errors: [err]
                            });
                        });
                } else {
                    return Promise.resolve(prop);
                }
            })).then(newData => {
                const final_data = cleanData(newData, { zones: zone_filter, use: use_filter});
                console.log('final data');
                console.log(final_data);
                return res.status(200).json(final_data);
            }).catch(err => {
                return Promise.reject(err);
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json(err);
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json(err);
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