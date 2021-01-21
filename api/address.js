const axios = require('axios');

const getAddressAttributes = async (address) => {
  const url = 'https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2';
  const resp = await axios.get(url, {
    params: {
      f: 'json',
      str: address,
    },
  });
  const data = resp?.data?.returnDataset?.Table1[0];
  if (!data) throw new Error('Could not get address attributes');
  return data;
};

const defaultPQOptions = {
  f: 'json',
  tolerance: 1,
  mapExtent: '400713.2,136977.93,400715.2,136979.93',
  imageDisplay: '100,100,96',
  returnGeometry: false,
};
const getPropertyQuestData = async ({x, y}, options = {}) => {
  const url = 'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/PropertyQuest/MapServer/identify';
  const resp = await axios.get(url, {
    params: {
      geometry: `{"x":${x},"y":${y}}`,
      ...defaultPQOptions,
      ...(options || {}),
    },
  });
  const results = resp.data.results || [];
  return results.reduce((acc, r) => {
    if (r.attributes) {
      return {
        ...acc,
        ...r.attributes,
      };
    }
    return acc;
  }, {});
};

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
const getSquareSuffixLot = async (ssl, fields) => {
  const endpoint = 'Location_WebMercator/MapServer/7/query';
  return getODDCResourceBySSL(endpoint, ssl, fields);
};

const getZoningRegulations = async (ssl, fields) => {
  const endpoint = 'Planning_Landuse_and_Zoning_WebMercator/MapServer/32/query';
  return getODDCResourceBySSL(endpoint, ssl, fields);
};

const getTaxLots = async (ssl, fields) => {
  const endpoint = 'Property_and_Land_WebMercator/MapServer/39/query';
  return getODDCResourceBySSL(endpoint, ssl, fields);
};

const getAppraisalData = async (type, ssl, fields) => {
  const serverNumber = {
    commercial: 23,
    residential: 25,
  }[type];
  if (!serverNumber) throw new Error(`${type} is not a valid appraisal type`);
  const endpoint = `Property_and_Land_WebMercator/MapServer/${serverNumber}/query`;
  return getODDCResourceBySSL(endpoint, ssl, fields);
};

const getPublicTaxData = async (ssl, fields) => {
  const endpoint = 'Property_and_Land_WebMercator/MapServer/53/query';
  return getODDCResourceBySSL(endpoint, ssl, fields);
};

module.exports.getAddressAttributes = getAddressAttributes;
module.exports.getPropertyQuestData = getPropertyQuestData;
module.exports.getSquareSuffixLot = getSquareSuffixLot;
module.exports.getZoningRegulations = getZoningRegulations;
module.exports.getTaxLots = getTaxLots;
module.exports.getAppraisalData = getAppraisalData;
module.exports.getPublicTaxData = getPublicTaxData;
