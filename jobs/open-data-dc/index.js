const {processSSL} = require('../../api/open-data-dc/client');
const {getAddressAttributes, getPropertyQuestData} = require('../../api/address');

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
  const {ZONING} = await getPropertyQuestData({x: xCoord, y: yCoord}, {layers: 'all:25,11'});
  return {
    ...oddcData,
    Zoning: ZONING,
  };
};

module.exports.getODDCData = getODDCData;
module.exports.process = async (context, task) => {
  return getODDCData(context.data.SSL, context.data.Address);
};
