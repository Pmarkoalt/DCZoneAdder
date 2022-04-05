const axios = require('axios');
const {isEntity, fetchEntityNameTriggers} = require('../prospects');
require('dotenv').config();

module.exports.queueConfig = {
  concurrency: 5,
  name: 'open-data-fc',
};

module.exports.jobConfig = {
  includeInputDataInExport: true,
};

const {FRANKLIN_COUNTY_API_URL} = process.env;

const getField = (data, fields) => {
  for (const field of fields) {
    const val = data[field];
    if (val !== undefined) return val;
  }
};

const PARCEL_ID_FIELDS = ['Parcel ID', 'PARCELID', 'Parcel'];
const ADDRESS_FIELDS = ['Address', 'Street Address'];

function parseIndividualName(name) {
  if (!name || !name.trim().length) return [undefined, undefined];
  const parts = name.split(' ');
  if (parts.length) parts.length = 2;
  const [last, first] = parts;
  return [first, last];
}

function parseName(name, entityNames) {
  if (!name || !name.trim().length) return undefined;
  if (isEntity(name, entityNames)) return name;
  return parseIndividualName(name);
}

let entityNameTriggers;
module.exports.process = async (context, task) => {
  // console.log('processing', context.data);
  if (!entityNameTriggers) {
    entityNameTriggers = await fetchEntityNameTriggers();
  }
  const parcelId = getField(context.data, PARCEL_ID_FIELDS);
  const address = getField(context.data, ADDRESS_FIELDS);
  const query = parcelId ? `parcelId=${parcelId}` : `address=${address}`;
  const resp = await axios.get(`${FRANKLIN_COUNTY_API_URL}/open-data?${query}`);
  return resp.data.map((data) => {
    let {ownerName1} = data;
    const _isEntity = isEntity(ownerName1, context.entityNameTriggers);
    const ownerName2 = parseIndividualName(data.ownerName2);
    if (!_isEntity) {
      ownerName1 = parseIndividualName(ownerName1);
    }
    return {
      'Parcel ID': data.parcelId,
      'Site Address': data.siteAddress?.street,
      City: data.siteAddress?.city,
      State: data.siteAddress?.state,
      'Zip Code': data.siteAddress?.zip,
      'Owner Name 1': _isEntity ? ownerName1 : ownerName1.join(' '),
      'Owner Name 1 First': _isEntity ? undefined : ownerName1[0],
      'Owner Name 1 Last': _isEntity ? undefined : ownerName1[1],
      'Owner Name 2 First': ownerName2[0],
      'Owner Name 2 Last': ownerName2[1],
      'Owner Address': data.ownerAddress?.street,
      'Owner City': data.ownerAddress?.city,
      'Owner State': data.ownerAddress?.state,
      'Owner Zip': data.ownerAddress?.zip,
      'Property Class Code': data.propertyClass?.code,
      'Property Class Description': data.propertyClass?.description,
    };
  });
};
