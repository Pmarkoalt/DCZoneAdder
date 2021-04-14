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

module.exports.generateId = generateId;
module.exports.forceCollection = forceCollection;
module.exports.formatSSL = formatSSL;
