const superagent = require('superagent');
const uses = require('./uses_master');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({trim: true});

const ZWSID = process.env.ZWSID;

module.exports.queueConfig = {
  concurrency: 5,
  name: 'zone',
};

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function normalizeObject(obj) {
  let key,
    keys = Object.keys(obj);
  let n = keys.length;
  const newobj = {};
  while (n--) {
    key = keys[n];
    newobj[key.toLowerCase()] = obj[key];
  }
  return newobj;
}

function cleanData(data) {
  // Removing unneccessary data
  delete data['address_url'];
  delete data['data_url'];
  delete data['x_coord'];
  delete data['y_coord'];
  delete data['zillowPropsURL'];
  if (data['Use Code']) {
    const match = uses.find((use) => {
      return data['Use Code'] === use.code;
    });
    if (match) {
      // Deleting and adding use code to end
      const code = data['Use Code'];
      delete data['Use Code'];
      data['Use Code'] = code;
      data['Use Title'] = `${match.name} ${match.class}`;
      data['Use Description'] = match.description;
    }
  }
  return data;
}

function arrToHash(array) {
  const hash = {};
  array.forEach((item) => {
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
      return Promise.reject('Unknown DC Gov API Error');
    }
  }
}

function checkPropData(response) {
  if (response.returnDataset && response.returnDataset.Table1.length) {
    return Promise.resolve(response);
  } else {
    if (response.returnCDDataSet && response.returnCDDataSet['Address Return Codes'].length) {
      let errors = [];
      response.returnCDDataSet['Address Return Codes'].forEach((code) => {
        if (code.Assessment !== 'Valid') {
          errors.push(code);
        }
      });
      return Promise.reject(errors);
    } else {
      return Promise.reject('Unknown Address Error');
    }
  }
}
function parsePropData(response) {
  if (response.returnDataset && response.returnDataset.Table1.length) {
    const returnData = response.returnDataset.Table1[0];
    // More data be pulled from this response, but this is the only useful data
    // The X and Y Coordinate (NOT LAT LONG) is crucial for finding zoning data
    const returnObj = {
      'Full Address': returnData.FULLADDRESS,
      'Street View URL': returnData.STREETVIEWURL,
      State: returnData.STATE,
      City: returnData.CITY,
      'Zip Code': returnData.ZIPCODE,
      'Confidence Level': returnData.ConfidenceLevel,
      x_coord: returnData.XCOORD,
      y_coord: returnData.YCOORD,
    };
    return Promise.resolve(returnObj);
  } else {
    return Promise.reject('Unknown Parsing Address Error');
  }
}
function checkAddData(response) {
  if (response.results.length) {
    return Promise.resolve(response);
  } else {
    return Promise.reject('No Available Zoning Data');
  }
}
function parseAddData(response) {
  if (response.results.length) {
    const returnObj = {};
    response.results.forEach((result) => {
      switch (result.layerId) {
        case 25:
          returnObj['Zone Description'] =
            result.attributes.Zone_Description && result.attributes.Zone_Description !== 'Null'
              ? result.attributes.Zone_Description
              : 'Unavailable';
          returnObj['Zone'] =
            result.attributes.ZONING && result.attributes.ZONING !== 'Null' ? result.attributes.ZONING : 'Unavailable';
          break;
        case 11:
          returnObj['Owner Name'] =
            result.attributes.OWNERNAME && result.attributes.OWNERNAME !== 'Null'
              ? result.attributes.OWNERNAME
              : 'Unavailable';
          returnObj['Owner Address'] =
            result.attributes.ADDRESS1 && result.attributes.ADDRESS1 !== 'Null'
              ? result.attributes.ADDRESS1
              : 'Unavailable';
          returnObj['Owner City Zip'] =
            result.attributes.CITYSTZIP && result.attributes.CITYSTZIP !== 'Null'
              ? result.attributes.CITYSTZIP
              : 'Unavailable';
          returnObj['Use Code'] =
            result.attributes.USECODE && result.attributes.USECODE !== 'Null'
              ? result.attributes.USECODE
              : 'Unavailable';
          returnObj['Sale Price'] =
            result.attributes.SALEPRICE && result.attributes.SALEPRICE !== 'Null'
              ? `$${result.attributes.SALEPRICE}`
              : 'Unavailable';
          returnObj['Sale Date'] =
            result.attributes.SALEDATE && result.attributes.SALEDATE !== 'Null'
              ? result.attributes.SALEDATE
              : 'Unavailable';
          returnObj['Current Price (Land)'] =
            result.attributes.PHASELAND && result.attributes.PHASELAND !== 'Null'
              ? `$${result.attributes.PHASELAND}`
              : 'Unavailable';
          returnObj['Current Price (Improvements)'] =
            result.attributes.PHASEBUILD && result.attributes.PHASEBUILD !== 'Null'
              ? `$${result.attributes.PHASEBUILD}`
              : 'Unavailable';
          returnObj['Current Price (Total)'] =
            result.attributes.ASSESSMENT && result.attributes.ASSESSMENT !== 'Null'
              ? `$${result.attributes.ASSESSMENT}`
              : 'Unavailable';
          returnObj['Proposed Price (Land)'] =
            result.attributes.NEWLAND && result.attributes.NEWLAND !== 'Null'
              ? `$${result.attributes.NEWLAND}`
              : 'Unavailable';
          returnObj['Proposed Price (Improvements)'] =
            result.attributes.NEWIMPR && result.attributes.NEWIMPR !== 'Null'
              ? `$${result.attributes.NEWIMPR}`
              : 'Unavailable';
          returnObj['Proposed Price (Total)'] =
            result.attributes.NEWTOTAL && result.attributes.NEWTOTAL !== 'Null'
              ? `$${result.attributes.NEWTOTAL}`
              : 'Unavailable';
          break;
        default:
          break;
      }
    });
    return Promise.resolve(returnObj);
  } else {
    return Promise.reject('Unknown Parsing Zoning Data Error');
  }
}
function checkZillowData(data) {
  if (data.ok) {
    return Promise.resolve(data.res);
  } else {
    return Promise.reject('Error with Zillow API');
  }
}
function xmltoJSON(response) {
  return parser
    .parseStringPromise(response.text)
    .then(function (result) {
      const parse_json = result['SearchResults:searchresults'].response
        ? result['SearchResults:searchresults'].response[0].results[0].result[0]
        : undefined;
      if (parse_json === undefined) return Promise.reject('No data found');
      return Promise.resolve(parse_json);
    })
    .catch(function (err) {
      console.log(err);
      return Promise.reject(err);
    });
}

function parseZillowData(data) {
  if (data) {
    const returnObj = {
      Zestimate: data.zestimate[0].amount[0]._ ? `$${data.zestimate[0].amount[0]._}` : 'Unavailable',
      'Zestimate Last Update': data.zestimate[0]['last-updated'][0]
        ? data.zestimate[0]['last-updated'][0]
        : 'Unavailable',
      'Zestimate (High)': data.zestimate[0].valuationRange[0].high[0]._
        ? `$${data.zestimate[0].valuationRange[0].high[0]._}`
        : 'Unavailable',
      'Zestimate (Low)': data.zestimate[0].valuationRange[0].low[0]._
        ? `$${data.zestimate[0].valuationRange[0].low[0]._}`
        : 'Unavailable',
    };
    return Promise.resolve(returnObj);
  } else {
    return Promise.reject('Unknown Parsing Zillow Error');
  }
}

function processAddress(item, task) {
  const basePropURL = 'https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2?str=';
  const baseDataURL1 =
    'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/PropertyQuest/MapServer/identify?f=json&tolerance=1&';
  const baseDataURL2 =
    'returnGeometry=false&imageDisplay=100%2C100%2C96&geometryType=esriGeometryPoint&sr=26985&mapExtent=400713.2%2C136977.93%2C400715.2%2C136979.93&layers=all%3A25%2C11%2C';
  const prop = normalizeObject(item.data);

  return new Promise((resolve, reject) => {
    if (prop.street) {
      prop.address_url = `${basePropURL}${encodeURI(prop.street)}&f=json`;
    } else if (prop.address) {
      prop.address_url = `${basePropURL}${encodeURI(prop.address)}&f=json`;
    } else {
      reject({message: 'no valid address'});
    }
    return superagent
      .get(prop.address_url)
      .then(checkRes)
      .then(checkPropData)
      .then(parsePropData)
      .then((response) => {
        task.progress(33);
        return resolve({
          ...prop,
          ...response,
        });
      })
      .catch((err) => {
        console.log(err);
        return reject({message: 'Problem finding address in DC Gov database', prop});
      });
  })
    .then((prop) => {
      prop.data_url = `${baseDataURL1}geometry=%7B%22x%22%3A${prop.x_coord}%2C%22y%22%3A${prop.y_coord}%7D${baseDataURL2}`;
      return superagent
        .get(prop.data_url)
        .then(checkRes)
        .then(checkAddData)
        .then(parseAddData)
        .then((response) => {
          task.progress(66);
          return Promise.resolve({
            ...prop,
            ...response,
          });
        })
        .catch((err) => {
          console.log(err);
          return Promise.reject({message: 'Problem finding tax information in DC Gov database', prop});
        });
    })
    .then((prop) => {
      if (item.searchZillow) {
        const address = encodeURI(prop['Full Address']);
        const cityStateZip = `${prop['City']} ${prop['State']} ${prop['Zip Code']}`;
        prop.zillowPropsURL = `http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=${ZWSID}&address=${address}&citystatezip=${cityStateZip}`;
        return superagent
          .get(prop.zillowPropsURL)
          .then(checkZillowData)
          .then(xmltoJSON)
          .then(parseZillowData)
          .then((response) => {
            task.progress(90);
            return Promise.resolve({
              ...prop,
              ...response,
            });
          })
          .catch((err) => {
            console.log(err);
            // No data from zillow so just return the record as is.
            if (err === 'No data found') {
              return Promise.resolve(prop);
            }
            return Promise.reject({message: 'Problem communicating with Zillow', prop});
          });
      } else {
        return Promise.resolve(prop);
      }
    })
    .then((prop) => {
      return cleanData(prop);
    });
}

async function fetchCurrentJob(job_id) {
  const addresses = await fetchAddress(job_id);
  const job_data = await fetchJobData(job_id);
  let address_data = addresses.map((item) => {
    return item.data;
  });
  if (job_data.zone_filters || job_data.use_filters) {
    address_data = address_data.filter((item) => {
      if (job_data.zone_filters && !job_data.zone_filters[item.Zone]) {
        return false;
      }
      if (job_data.use_filters && !job_data.use_filters[item['Use Code']]) {
        return false;
      }
      return true;
    });
  }
  const {csv_export_fields: customKeys = []} = job_data;
  const keys = customKeys.length > 0 ? customKeys : await createKeys(addresses, address_data);
  io.sockets.emit('csv_update', {
    job_id: job_id,
    addresses: address_data,
    job_complete: job_data.completed,
    keys: keys,
  });
  return {
    job_id: job_id,
    addresses: address_data,
    job_complete: job_data.completed,
    keys: keys,
    export_file_name: job_data.export_file_name,
  };
}

async function fetchAddress(job_id) {
  try {
    return Addresses.find({job_id, complete: true}).lean();
  } catch (err) {
    console.log(err);
  }
}

async function fetchJobData(job_id) {
  return new Promise((resolve, reject) => {
    return Jobs.findOne({job_id}, (err, doc) => {
      if (err) console.log(err);
      if (!doc) return resolve({});
      const job = doc.toObject();

      // Update if job is complete
      if (job.completed_items + job.failed_items === job.total_items && job.completed === false) {
        return Jobs.findOneAndUpdate(
          {job_id},
          {
            $set: {
              completed: true,
            },
          },
          {new: true},
          (err, doc) => {
            if (err) console.log(err);
            return resolve(doc);
          },
        );
      } else {
        return resolve(job);
      }
    });
  });
}

async function createKeys(addresses, data) {
  return new Promise((resolve, reject) => {
    for (let i = 0; data.length > i; i++) {
      if (addresses[i].complete) {
        console.log('complete');
        keys = Object.keys(data[i]);
        return resolve(keys);
      }
    }
    return resolve({});
  });
}

function splitAddressDash(csv_array) {
  const return_array = [];
  for (let i = 0; csv_array.length > i; i++) {
    if (csv_array[i].Address.match(/[0-9][-][0-9]/)) {
      const space_index = csv_array[i].Address.indexOf(' ');
      const dash_index = csv_array[i].Address.indexOf('-');
      const street_address = csv_array[i].Address.slice(space_index + 1);

      const first_number = parseInt(csv_array[i].Address.slice(0, dash_index));
      const second_number = parseInt(csv_array[i].Address.slice(dash_index + 1, space_index));
      for (let j = first_number; second_number >= j; j++) {
        const tempAddress = Object.assign({}, csv_array[i]);
        tempAddress.Address = `${j} ${street_address}`;
        return_array.push(tempAddress);
      }
    } else {
      return_array.push(csv_array[i]);
    }
  }
  return return_array;
}

module.exports.parse = splitAddressDash;

// module.exports.taskContext = (job, task) => {
//   return {searchZillow: job.searchZillow};
// };

module.exports.process = async (address, task) => {
  return await processAddress(address, task);
  // await fetchCurrentJob(current_address.job_id);
};
