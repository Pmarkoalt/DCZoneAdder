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
  let suffix = '';

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
  const sq = suffix.length ? square.replace(suffix, '') : square;
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

const formatOwnerName = (_name) => {
  try {
    let parts = _name.split(',').map((p) => p.trim());
    const name = parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0];
    parts = name.split(' ');
    const first = parts[0].replace(/[\W0-9]/gi, '');
    let last = parts.length > 1 ? parts.pop() : undefined;
    if (last) {
      last = last.replace(/[\W0-9]/gi, '');
    }
    return last ? `${first} ${last}` : first;
  } catch {
    return _name;
  }
};

const assembleAddress = (address1, address2, citystzip) => {
  try {
    let address = address1;
    if (address2 && !address1.endsWith(address2)) {
      address += ` ${address2}`;
    }
    const [city, state, zip] = citystzip.split(' ').filter((x) => x !== '');
    return `${address}, ${city} ${state} ${zip.split('-')[0]}`;
  } catch {
    return 'ERROR';
  }
};

module.exports.generateId = generateId;
module.exports.forceCollection = forceCollection;
module.exports.formatSSL = formatSSL;
module.exports.createCSVString = createCSVString;
module.exports.monthDiff = monthDiff;
module.exports.formatOwnerName = formatOwnerName;
module.exports.assembleAddress = assembleAddress;
