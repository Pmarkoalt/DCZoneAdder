const {Parser} = require('json2csv');

function generateId() {
  var length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function forceCollection(item) {
  if (Array.isArray(item)) return item;
  return [item];
}

function formatSSL(ssl) {
  const pairs = ssl.split(' ').filter((x) => x !== '');
  if (!pairs || pairs.length !== 2) {
    throw new Error(`SSL: ${ssl}, is not in a valid format`);
  }
  const [square, lot] = pairs;
  let suffix = "";

  const match = square.match(/([a-z]+)?\d+([a-z]+)?/i);
  if (match) {
    if (match[1] && match[2]) {
      throw new Error(`SSL: ${ssl}, is not in a valid format`);
    } else if (match[1]) {
      suffix = match[1];
    } else if (match[2]) {
      suffix = match[2];
    }
  }
  const sq = suffix.length ? square.replace(suffix, "") : square;
  return `${(sq.padStart(4, '0') + suffix.toUpperCase()).padEnd(8, ' ')}${lot.padStart(4, '0')}`;
}

function createCSVString(data) {
  const keys = Object.keys(data[0]);
  const parser = new Parser({fields: keys});
  const csv = parser.parse(data);
  return csv;
}

function monthDiff(d1, d2) {
  const timeDiff = (d2.getTime() - d1.getTime()) / 1000;
  const secondsPerMonth = (60 * 60 * 24 * 365) / 12;
  return timeDiff / secondsPerMonth;
}

module.exports.generateId = generateId;
module.exports.forceCollection = forceCollection;
module.exports.formatSSL = formatSSL;
module.exports.createCSVString = createCSVString;
module.exports.monthDiff = monthDiff;
