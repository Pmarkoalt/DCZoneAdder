const axios = require('axios');
const lodash = require('lodash');
const {EXPORT_MAPPINGS, OpenDataDC} = require('./mappings');
const {forceCollection} = require('../../jobs/utils');

const DC_OPEN_DATA_URL = 'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA';
const getODDCResourceBySSL = async (endpoint, ssl, fields = ['*']) => {
  const url = `${DC_OPEN_DATA_URL}/${endpoint}`;
  const resp = await axios.get(url, {
    params: {
      f: 'json',
      outFields: fields.join(','),
      where: `SSL = '${ssl}'`,
    },
  });
  const features = resp?.data?.features || [];
  return features[0]?.attributes;
};

async function process(ssl, _fields = []) {
  const fields = _fields.length ? _fields.map((f) => EXPORT_MAPPINGS[f]) : Object.values(EXPORT_MAPPINGS);
  const openDataDCFieldGroups = fields.reduce((acc, field) => {
    for (const source of forceCollection(field.source)) {
      const [api, attr] = source.split('.');
      if (!acc[api]) {
        acc[api] = [];
      }
      acc[api].push(attr);
    }
    return acc;
  }, {});
  console.log(openDataDCFieldGroups);

  const results = {};
  const promises = Object.entries(openDataDCFieldGroups).map(([api, fields]) => {
    const {endpoint} = OpenDataDC[api]['_meta'];
    return getODDCResourceBySSL(endpoint, ssl, fields).then((r) => {
      results[api] = r;
    });
  });
  await Promise.all(Object.values(promises));
  // console.log(results);

  const csvObj = {};
  const alternativeFieldsReq = [];
  for (const field of fields) {
    if (Array.isArray(field.source)) {
      const values = field.source.map(lodash.get.bind(null, results));
      const value = field.format ? field.format(...values) : values.join(' ');
      csvObj[field.columnName] = value;
    } else {
      const value = lodash.get(results, field.source);
      if ((value === null || value === undefined) && field.alternative) {
        alternativeFieldsReq.push(field);
      } else {
        csvObj[field.columnName] = field.format ? field.format(value) : value;
      }
    }
  }

  if (alternativeFieldsReq.length) {
    console.log('YEEEET');
  }

  console.log(alternativeFieldsReq);
  console.log(csvObj);
  return csvObj;
}

process('2664    0050');
