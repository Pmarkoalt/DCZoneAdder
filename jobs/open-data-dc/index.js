const {processSSL} = require('../../api/open-data-dc/client');
const {getZillowData} = require('../../api/zillow/client');
const {getAddressAttributes, getPropertyQuestData} = require('../../api/address');
const {formatSSL, parseAddress} = require('../../jobs/utils');

module.exports.jobConfig = {
  includeInputDataInExport: true,
};

module.exports.queueConfig = {
  concurrency: 5,
  name: 'open-data-dc',
};

const getODDCData = async (ssl, address) => {
  let xCoord, yCoord;
  if (!ssl) {
    if (address) {
      const {SSL, XCOORD, YCOORD} = await getAddressAttributes(address);
      ssl = SSL;
      xCoord = XCOORD;
      yCoord = YCOORD;
    } else {
      throw new Error('SSL or Address are required but cannot be found.');
    }
  }
  const oddcData = await processSSL(ssl);
  if ((!xCoord || !yCoord) && oddcData.Address) {
    const {XCOORD, YCOORD} = await getAddressAttributes(oddcData.Address);
    xCoord = XCOORD;
    yCoord = YCOORD;
  }
  const {ZONING, OWNERNAME, OWNNAME2} = await getPropertyQuestData({x: xCoord, y: yCoord}, {layers: 'all:25,11'});
  if (OWNERNAME && OWNERNAME !== 'Null') {
    oddcData['Owner Name 1'] = OWNERNAME;
  }
  if (OWNNAME2 && OWNNAME2 !== 'Null') {
    oddcData['Owner Name 2'] = OWNNAME2;
  }
  return {
    ...oddcData,
    Zoning: ZONING,
  };
};

module.exports.getODDCData = getODDCData;
module.exports.process = async (context, task) => {
  let SSL = context.data.SSL;
  if (!SSL) {
    const {Square, Lot} = context.data;
    if (Square && Lot) {
      SSL = formatSSL(`${Square} ${Lot}`);
    }
  }
  let openDataResult = await getODDCData(SSL, context.data.Address);
  // if (context.context.searchZillow) {
  //   try {
  //     const address = parseAddress(openDataResult['Mailing Address']);
  //     const zillowData = await getZillowData(address);
  //     if (zillowData) {
  //       openDataResult = {
  //         ...openDataResult,
  //         ...zillowData,
  //       };
  //     }
  //   } catch (e) {
  //     console.log('Error requesting Zillow API data', e);
  //   }
  // }
  return openDataResult;
};
