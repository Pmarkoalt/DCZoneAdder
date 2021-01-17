const {processSSL} = require("../../api/open-data-dc/client");
const {getAddressAttributes} = require("../../api/address");

module.exports.jobConfig = {
  includeInputDataInExport: true,
};

module.exports.queueConfig = {
  concurrency: 5,
  name: 'open-data-dc',
};

module.exports.process = async (context, task) => {
  let ssl = context.data.SSL;
  if (!ssl && context.data.Address) {
    const {SSL, XCOORD, YCOORD} = await getAddressAttributes(address);
    ssl = SSL;
    task.coordinates = {XCOORD, YCOORD};
  } else {
    throw new Error("SSL or Address are required but cannot be found.");
  }
  return await processSSL(context.data.SSL, task);
};
