const {getAddressAttributes, getPropertyQuestData, getAppraisalData, getPublicTaxData} = require('../../api/address');
const {formatOwnerName, assembleAddress} = require('./formatting');

module.exports.jobConfig = {
  includeInputDataInExport: true,
};

module.exports.queueConfig = {
  concurrency: 5,
  name: 'belles',
};

const fetchAppraisalData = async (ssl) => {
  const data = await getAppraisalData('residential', ssl, ['GBA', 'NUM_UNITS']);
  if (!data) return getAppraisalData('commercial', ssl, ['LIVING_GBA', 'NUM_UNITS']);
  return data;
};
const fetchPQData = async (x, y) => {
  const {ZONING, RECORD_AREA_SF} = await getPropertyQuestData({x, y}, {layers: 'all:25,11'});
  return {ZONING, RECORD_AREA_SF};
};

async function processAddress(address, task) {
  const {SSL, XCOORD, YCOORD} = await getAddressAttributes(address);
  if (!SSL) throw new Error(`Could not get SSL for ${address}`);
  const [pq, appraisal, tax] = await Promise.all([
    fetchPQData(XCOORD, YCOORD),
    fetchAppraisalData(SSL),
    getPublicTaxData(SSL, [
      'USECODE',
      'SALEPRICE',
      'SALEDATE',
      'OWNERNAME',
      'OWNNAME2',
      'ADDRESS1',
      'ADDRESS2',
      'CITYSTZIP',
    ]),
  ]);
  const placeholder = '?????';
  const result = {
    Address: address,
    SSL: SSL,
  };
  if (pq) {
    result.Zoning = pq.ZONING;
    result['Lot SQF'] = pq.RECORD_AREA_SF;
  } else {
    result.Zoning = placeholder;
    result['Lot SQF'] = placeholder;
  }
  if (appraisal) {
    result['Building Total SQF'] = appraisal.GBA ?? appraisal.LIVING_GBA;
    result.Units = appraisal.NUM_UNITS;
  } else {
    result['Building Total SQF'] = placeholder;
    result.Units = placeholder;
  }
  if (tax) {
    result.Use = tax.USECODE;
    result['Sale Price'] = tax.SALEPRICE;
    result['Sale Date'] = tax.SALEDATE ? new Date(tax.SALEDATE).toISOString() : undefined;
    result['Current Owner'] = formatOwnerName(tax.OWNERNAME);
    result['Second Owner'] = formatOwnerName(tax.OWNNAME2);
    result['Owner Address + Owner City State + Owner Zip'] = assembleAddress(tax.ADDRESS1, tax.ADDRESS2, tax.CITYSTZIP);
  } else {
    result.Use = placeholder;
    result['Sale Price'] = placeholder;
    result['Sale Date'] = placeholder;
    result['Current Owner'] = placeholder;
    result['Second Owner'] = placeholder;
    result['Owner Address + Owner City State + Owner Zip'] = placeholder;
  }
  return result;
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

module.exports.process = async (context, task) => {
  return await processAddress(context.data.Address.trim(), task);
};
