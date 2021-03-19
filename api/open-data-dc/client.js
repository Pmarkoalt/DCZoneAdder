const axios = require('axios');
const lodash = require('lodash');
const {EXPORT_MAPPINGS, OpenDataDC} = require('./mappings');
const {forceCollection, formatSSL} = require('../../jobs/utils');

const DC_OPEN_DATA_URL = 'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA';
const getODDCResourceBySSL = async (endpoint, where, fields = ['*']) => {
  const url = `${DC_OPEN_DATA_URL}/${endpoint}`;
  const resp = await axios.get(url, {
    params: {
      f: 'json',
      outFields: fields.join(','),
      where: `${where.attr} = '${where.value}'`,
    },
  });
  const features = resp?.data?.features || [];
  return features[0]?.attributes;
};

function mergeAPIGroups(target, source) {
  Object.entries(source).forEach(([api, attrs]) => {
    if (target[api]) {
      target[api].push(...attrs);
    } else {
      target[api] = attrs;
    }
  });
}

function createAPIGroupsFromFieldList(fields = [], apiFieldSource = 'source') {
  return fields.reduce((acc, field) => {
    // Some fields require multiple resources so its easier to treat everything like a list
    // even if that list is just contains one element.
    for (const source of forceCollection(lodash.get(field, apiFieldSource))) {
      const [api, attr] = source.split('.');
      if (!acc[api]) {
        acc[api] = [];
      }
      acc[api].push(attr);
    }
    return acc;
  }, {});
}

async function batchOpenDataDCRequest(ssl, groups) {
  /* For each API resource group, create a request and when that request resolves
   * store the result in the API's namespace for easy lookup later. */
  const results = {};
  const promises = Object.entries(groups).map(([api, fields]) => {
    const {endpoint} = OpenDataDC[api]['_meta'];
    return getODDCResourceBySSL(endpoint, {attr: 'SSL', value: ssl}, fields).then((r) => {
      results[api] = r;
    });
  });
  // Ensure all open data dc request are finished before trying to access the results.
  await Promise.all(Object.values(promises));
  // console.log(results);
  return results;
}

async function processSSL(_ssl, _fields = []) {
  const ssl = formatSSL(_ssl);
  // Generate a list of the field objects with their full meta information, looked up by their column name
  let fields = Object.values(EXPORT_MAPPINGS);
  if (_fields.length) {
    fields = _fields.map((f) => {
      const field = EXPORT_MAPPINGS[f];
      if (!field) {
        throw new Error(`Invalid field name: ${f}`);
      }
      return field;
    });
  }

  // Organize the required API resources by grouping attributes by their respective API endpoint.
  const openDataDCFieldGroups = createAPIGroupsFromFieldList(
    fields.filter((f) => !f.lookup),
    'source',
  );
  const lookupFields = createAPIGroupsFromFieldList(
    fields.filter((f) => f.lookup),
    'lookup.value',
  );
  mergeAPIGroups(openDataDCFieldGroups, lookupFields);
  // console.log(openDataDCFieldGroups);

  const results = await batchOpenDataDCRequest(ssl, openDataDCFieldGroups);

  /* Now that we have the first batch of API response, we can start to build out
   * the CSV object. Certain fields have alternative sources defined so for each
   * field, if there is no value found, and there is an alternative source, we
   * have to add it to `alternativeFieldsReq` so we can make the second batch of
   * calls later.
   *
   * NOTE: Multi attribute fields currently do not support alternative sources.
   * */
  const csvObj = {};
  for (const field of fields.filter((f) => f.lookup)) {
    const lookupValue = lodash.get(results, field.lookup.value);
    const [api, attr] = field.source.split('.');
    const {endpoint} = OpenDataDC[api]['_meta'];
    const lookupResult = await getODDCResourceBySSL(endpoint, {attr: field.lookup.attr, value: lookupValue}, [attr]);
    results[api] = {
      ...(results.api || {}),
      ...lookupResult,
    };
  }

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
    // console.log('Looking up alternative sources');
    // console.log(alternativeFieldsReq);
    const altAPIGroups = createAPIGroupsFromFieldList(alternativeFieldsReq, 'alternative');
    const altResults = await batchOpenDataDCRequest(ssl, altAPIGroups);
    for (const field of alternativeFieldsReq) {
      const value = lodash.get(altResults, field.alternative);
      csvObj[field.columnName] = field.format ? field.format(value) : value;
    }
  }

  // console.log(csvObj);
  return csvObj;
}

// processSSL('2664    0050');
module.exports.processSSL = processSSL;
