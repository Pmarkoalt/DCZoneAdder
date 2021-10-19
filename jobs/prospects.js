const lodash = require('lodash');
const {createCSVZipFolder, monthDiff, parseAddress, readGoogleSheet} = require('./utils');
const classMap = require('./open-data-dc/prop-use-class-map');
const tierMap = require('./open-data-dc/neighborhood-tiers');

const toDate = (str) => (str ? new Date(str) : undefined);

const defaultEntityNameTriggers = [
  'ASSOC',
  'CAPITAL',
  'CHURCH',
  'COMPANY',
  'CORP',
  'COUNTY',
  'DEVELOP',
  'DISTRICT',
  'ENTERPRISE',
  'FOUNDATION',
  'FSB',
  'GOVERN',
  'HOLDING',
  'INC',
  'INVEST',
  'LIMITED',
  'LLC',
  'LP',
  'LTD',
  'MINISTR',
  'NATCO',
  'NATION',
  'PARTNER',
  'PROPERT',
  'SCHOOL',
  'SDA',
  'STATE',
  'TEMPLE',
  'THE',
  'TRUST',
  'UNION',
  'UNITED',
  'VENTURE',
  'WMATA',
];

async function fetchEntityNameTriggers() {
  try {
    const sheetId = '1416we19U-0sUXn_lZNNiNP99_w0z2YEKzCTymG-Z2UM';
    const resp = await readGoogleSheet(sheetId, 'Entity Filters.csv!A1:A');
    return lodash.flattenDeep(resp);
  } catch (e) {
    console.log('Error fetching entity list, falling back to default', e);
    return defaultEntityNameTriggers;
  }
}
module.exports.fetchEntityNameTriggers = fetchEntityNameTriggers;

const isEntity = (name, entityNameTriggers = defaultEntityNameTriggers) => {
  return Boolean(name && entityNameTriggers.some((check) => name.toUpperCase().includes(check.toUpperCase())));
};
module.exports.isEntity = isEntity;

const getIndividualFirstLastName = (name, ctx) => {
  if (!name || isEntity(name, ctx.entityNameTriggers)) return [undefined, undefined];
  try {
    if (name.includes(',')) {
      let [last, first] = name
        .trim()
        .split(',')
        .map((x) => x.trim());
      first = first.split(' ')[0];
      return [first, last];
    }
    return name.trim().split(' ');
  } catch {
    return [undefined, undefined];
  }
};

const setMailingAddressData = (data) => {
  const mailingAddress = data['Mailing Address'];
  const {street, city, state, zip} = parseAddress(mailingAddress);
  data['Mailing Street Address'] = street;
  data['Mailing City'] = city;
  data['Mailing State'] = state;
  data['Mailing Zip'] = zip;
};

const PIP_TYPE = {
  ODDC: 'OD', // open data dc
  ROD: 'ROD', // recorder of deeds
  DCSC: 'DCSC', // dc superior court
};

const checkSaleDate = (pipType, data) => {
  switch (pipType) {
    case PIP_TYPE.ROD:
      return !data['Sale Date'] || toDate(data['Sale Date']) < toDate(data.Recorded);
    case PIP_TYPE.DCSC:
      return !data['Sale Date'] || toDate(data['Sale Date']) < toDate(data['File Date']);
    case PIP_TYPE.ODDC:
      return !data['Sale Date'] || monthDiff(toDate(data['Sale Date']), new Date()) < 6;
    default:
      throw new Error(`Invalid pip type: ${pipType}`);
  }
};

const checkClass = (pipType, data, taxRatio = 0.6) => {
  if ([PIP_TYPE.DCSC, PIP_TYPE.ROD].includes(pipType)) {
    return !data.CLASS || ['1', '2'].includes(String(data.CLASS));
  }
  if (['1', '2'].includes(data.CLASS)) {
    let x;
    if (data.CLASS === '1') {
      x = 0.0085;
    } else if (data.CLASS === '2') {
      x = 0.0165;
    } else if (data.CLASS === ['1', '2']) {
      x = 0.0125;
    }
    return data.TOTBALAMT / (data['Ass. Value (ITS)'] * x) > parseFloat(taxRatio);
  } else if ([undefined, '3', '4'].includes(data.CLASS)) {
    return true;
  }
};

const getPropertyType = (data) => {
  let units = data['MAR Num Units'];
  let propertyUse = data['Property Use'];
  if (!propertyUse) return null;
  propertyUse = propertyUse.toUpperCase();
  units = units ? String(units) : units;
  if (propertyUse.includes('SINGLE')) {
    return 'SFH';
  }
  if (propertyUse.includes('RESIDENTIAL')) {
    if (units === '1') {
      return 'Unit';
    }
    if (['2', '3', '4'].includes(units)) {
      return 'MFH (2 to 4)';
    } else {
      const numUnits = parseInt(units);
      if (!isNaN(numUnits) && numUnits >= 5) {
        return 'MFH (5 plus)';
      }
    }
  }
  return 'Other';
};

const getPIPSubtype = (pipType, data) => {
  if (pipType === PIP_TYPE.ROD) {
    return data['Doc Type'];
  } else if (pipType === PIP_TYPE.ODDC) {
    return [undefined, '1', '2', ['1', '2']].includes(data.CLASS) ? 'Tax' : 'Vacancy';
  } else if (pipType === PIP_TYPE.DCSC) {
    try {
      return data['Case Number'].split(' ')[1];
    } catch {
      return;
    }
  }
};

const tagRecord = (pipType, data, ctx = {}) => {
  const record = {
    data,
    tags: {},
  };

  record.tags.hasOwnerName = Boolean(data['Owner Name 1']);

  record.data['Neighborhood Tier'] = tierMap[data['Neighborhood']];

  record.tags.marNumUnitsMatch =
    !data['MAR Num Units'] || ['0', '1', '2', '3', '4', '5'].includes(String(data['MAR Num Units']));

  record.tags.saleDateMatch = checkSaleDate(pipType, data);

  const [firstName, lastName] = getIndividualFirstLastName(data['Owner Name 1'], ctx);
  record.data['First Name'] = firstName;
  record.data['Last Name'] = lastName;

  record.data.CLASS = String(data.CLASS || classMap[data['Property Use']]);
  record.tags.classMatch = checkClass(pipType, data, ctx.taxRatio);

  record.tags.propertyType = getPropertyType(data);
  setMailingAddressData(record.data);

  record.tags.ownerType = isEntity(record.data['Owner Name 1'], ctx.entityNameTriggers) ? 'Entity' : 'Individual';
  const {hasOwnerName, marNumUnitsMatch, saleDateMatch, classMatch} = record.tags;
  record.tags.isEligible = hasOwnerName && marNumUnitsMatch && saleDateMatch && classMatch;

  record.tags.groupId = 'failed';
  record.tags.filename = 'Failed.csv';
  if (record.tags.isEligible) {
    const {propertyType, ownerType} = record.tags;
    const subtype = getPIPSubtype(pipType, record.data);
    record.tags.groupId = `${ownerType}:${propertyType}:${subtype}`;
    record.tags.filename = `${pipType} - ${subtype} - ${propertyType} - ${ownerType}.csv`;
  }

  return record;
};

const processRecords = (pipType, records, ctx = {}) => {
  const taggedRecords = records.map((r) => tagRecord(pipType, r, ctx));
  let groups = lodash.groupBy(taggedRecords, 'tags.filename');
  groups = Object.entries(groups).reduce((acc, [filename, records]) => {
    acc[filename] = records.map((r) => r.data);
    return acc;
  }, {});
  return createCSVZipFolder(groups);
};
module.exports.prospectIdentificationProcess = processRecords;
