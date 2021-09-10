require('dotenv').config();
const axios = require('axios');
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser({trim: true});

function xmltoJSON(xml) {
  return xmlParser
    .parseStringPromise(xml)
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

module.exports.getZillowData = async ({street, city, state, zip}) => {
  const ZWSID = process.env.ZWSID;
  if (!ZWSID) {
    throw Error('Missing Zillow key');
  }
  const cityStateZip = `${city} ${state} ${zip}`;
  const url = `http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=${ZWSID}&address=${street}&citystatezip=${cityStateZip}`;
  const resp = await axios.get(url);
  const json = await xmltoJSON(resp.data);
  return parseZillowData(json);
};

// module.exports.getZillowData({
//   street: '1106 Columbia Rd NW Apt 302',
//   city: 'Washington',
//   state: 'DC',
//   zip: '20006',
// });
