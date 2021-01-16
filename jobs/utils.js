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

module.exports.generateId = generateId;
module.exports.forceCollection = forceCollection;
