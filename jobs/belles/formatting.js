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

module.exports.formatOwnerName = formatOwnerName;
module.exports.assembleAddress = assembleAddress;
