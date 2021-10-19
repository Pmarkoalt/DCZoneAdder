require('dotenv').config();
const axios = require('axios');
// const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');
const xml2js = require('xml2js');
const {parseAddress} = require('../../jobs/utils');
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

module.exports.getZillowData = async (address) => {
  const {street, city, state, zip} = parseAddress(address);
  const ZWSID = process.env.ZWSID;
  if (!ZWSID) {
    throw Error('Missing Zillow key');
  }
  const cityStateZip = `${city} ${state} ${zip}`;
  console.log(street, cityStateZip);
  const url = `http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=${ZWSID}&address=${street}&citystatezip=${cityStateZip}`;
  const resp = await axios.get(url);
  const json = await xmltoJSON(resp.data);
  return parseZillowData(json);
};

// module.exports.scrapeZillowData = async (address) => {
//   const userAgent =
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36';
//   const {street, city, state, zip} = parseAddress(address);
//   const BASE_URL = 'https://zillow.com/homes';
//   console.log(street, city, state, zip);
//   const formattedAddress = `${street} ${city}, ${state} ${zip.replace('-', '.dash.')}`.replace(/ /g, '-');
//   const url = `${BASE_URL}/${formattedAddress}_rb/`;
//   console.log(url);
//   // const browser = await puppeteer.launch();
//   // const page = await browser.newPage();
//   // page.setUserAgent(userAgent);
//   // const thing = await page.goto(url);
//   // console.log(thing);
//   const headers = {
//     'user-agent': userAgent,
//   };
//   const {data: html} = await axios.get(url, {headers});
//   const $ = cheerio.load(html);
//   console.log(html);
//   console.log($('#dsChipZestimateTooltip span')[0].text());
// };

// module.exports.scrapeZillowData('10608 Terrapin Hills Ct Bowie, MD 20721');

// module.exports.getZillowData({
//   street: '1106 Columbia Rd NW Apt 302',
//   city: 'Washington',
//   state: 'DC',
//   zip: '20006',
// });
