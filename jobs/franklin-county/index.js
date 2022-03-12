const axios = require('axios');
require('dotenv').config();

module.exports.queueConfig = {
  concurrency: 5,
  name: 'open-data-fc',
};

module.exports.jobConfig = {
  includeInputDataInExport: true,
};

const {FRANKLIN_COUNTY_API_URL} = process.env;

module.exports.process = async (context, task) => {
  console.log('processing', context.data);
  const parcelId = context.data['Parcel ID'];
  const address = context.data['Address'];
  const query = parcelId ? `parcelId=${parcelId}` : `address=${address}`;
  const resp = await axios.get(`${FRANKLIN_COUNTY_API_URL}/open-data?${query}`);
  return resp.data.map((data) => {
    const {ownerName1 = []} = data;
    const {ownerName2 = []} = data;
    return {
      'Parcel ID': data.parcelId,
      'Site Address': data.siteAddress.street,
      City: data.siteAddress.city,
      State: data.siteAddress.state,
      'Zip Code': data.siteAddress.zip,
      'Owner Name 1': ownerName1.join(' '),
      'Owner Name 1 First': ownerName1[0],
      'Owner Name 1 Last': ownerName1[1],
      'Owner Name 2 First': ownerName2[0],
      'Owner Name 2 Last': ownerName2[1],
      'Owner Address': data.ownerAddress.street,
      'Owner City': data.ownerAddress.city,
      'Owner State': data.ownerAddress.state,
      'Owner Zip': data.ownerAddress.zip,
      'Property Class Code': data.propertyClass?.code,
      'Property Class Description': data.propertyClass?.description,
    };
  });
};
