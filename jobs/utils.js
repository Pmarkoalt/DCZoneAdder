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
  const suffix = isNaN(parseInt(square.charAt(0))) ? square.charAt(0) : null;
  let sq = square;
  let spaces = '    ';
  if (suffix) {
    sq = sq.replace(suffix, '') + suffix;
    spaces = '   ';
  }
  return `${sq.padStart(4, '0')}${spaces}${lot.padStart(4, '0')}`;
}

module.exports.generateId = generateId;
module.exports.forceCollection = forceCollection;
module.exports.formatSSL = formatSSL;
