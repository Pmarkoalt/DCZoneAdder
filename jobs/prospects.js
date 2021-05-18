const lodash = require('lodash');
const AdmZip = require('adm-zip');
const {createCSVString, monthDiff} = require('./utils');
const classMap = require('./open-data-dc/prop-use-class-map');

const toDate = (str) => (str ? new Date(str) : undefined);

const getAsCSVBuffer = (data) => {
  const csv = createCSVString(data);
  return Buffer.alloc(csv.length, csv);
};

const entityList = [
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

const rod = (records) => {
  const zip = new AdmZip();
  const process = (docType, docTypeGroup) => {
    const match = (data) => {
      data.CLASS = data.CLASS || classMap[data['Property Use']];
      const saleDateMatch = !data['Sale Date'] || toDate(data['Sale Date']) < data.Recorded;
      const classMatch = !data.CLASS || ['1', '2'].includes(data.CLASS);
      const marNumUnitsMatch = !data['MAR Num Units'] || ['1', '2', '3', '4'].includes(data['MAR Num Units']);
      return saleDateMatch && classMatch && marNumUnitsMatch;
    };
    const {true: matched, false: failed} = lodash.groupBy(docTypeGroup, match);
    const {true: entities, false: individuals} = lodash.groupBy(matched, (data) => {
      const name = data['Owner Name 1'];
      if (!name) return false;
      return entityList.some((check) => name.toUpperCase().includes(check));
    });
    if (entities) zip.addFile(`${docType} Entities.csv`, getAsCSVBuffer(entities));
    if (individuals) zip.addFile(`${docType} Individuals.csv`, getAsCSVBuffer(individuals));
    if (failed) zip.addFile(`${docType} Failed.csv`, getAsCSVBuffer(failed));
  };
  const groups = lodash.groupBy(records, 'Doc Type');
  Object.entries(groups).forEach(([key, value]) => process(key, value));
  return zip.toBuffer();
};

const ltb = (records) => {
  const zip = new AdmZip();
  const match = (data) => {
    data.CLASS = data.CLASS || classMap[data['Property Use']];
    const saleDateMatch = !data['Sale Date'] || toDate(data['Sale Date']) < data['File Date'];
    const classMatch = !data.CLASS || ['1', '2'].includes(data.CLASS);
    const marNumUnitsMatch = !data['MAR Num Units'] || ['1', '2', '3', '4'].includes(data['MAR Num Units']);
    return saleDateMatch && classMatch && marNumUnitsMatch;
  };
  const {true: matched, false: failed} = lodash.groupBy(records, match);
  const {true: entities, false: individuals} = lodash.groupBy(matched, (data) => {
    const name = data['Owner Name 1'];
    if (!name) return false;
    return entityList.some((check) => name.toUpperCase().includes(check));
  });
  if (entities) zip.addFile('Successful - LTB Entities.csv', getAsCSVBuffer(entities));
  if (individuals) zip.addFile('Successful - LTB Individuals.csv', getAsCSVBuffer(individuals));
  if (failed) zip.addFile('Failed - LTB.csv', getAsCSVBuffer(failed));
  return zip.toBuffer();
};

const oddc = (records) => {
  const zip = new AdmZip();
  const match = (data) => {
    const saleDateMatch = !data['Sale Date'] || monthDiff(toDate(data['Sale Date']), new Date()) > 6;
    let classMatch = false;
    data.CLASS = data.CLASS || classMap[data['Property Use']];
    if (['1', '2'].includes(data.CLASS)) {
      let x;
      if (data.CLASS === '1') {
        x = 0.0085;
      } else if (data.CLASS === '2') {
        x = 0.0165;
      } else if (data.CLASS === ['1', '2']) {
        x = 0.0125;
      }
      classMatch = data.TOTBALAMT / (data['Ass. Value (ITS)'] * x) > 0.6;
    } else if ([undefined, '3', '4'].includes(data.CLASS)) {
      classMatch = true;
    }
    const marNumUnitsMatch = !data['MAR Num Units'] || ['1', '2', '3', '4'].includes(data['MAR Num Units']);
    return saleDateMatch && classMatch && marNumUnitsMatch;
  };
  const {true: matched, false: failed} = lodash.groupBy(records, match);
  const {true: highTax, false: vacant} = lodash.groupBy(matched, (data) => {
    return [undefined, '1', '2', ['1', '2']].includes(data.CLASS);
  });
  if (highTax) zip.addFile('Successful - High Tax Ratio.csv', getAsCSVBuffer(highTax));
  if (vacant) zip.addFile('Successful - Vacant or Blighted.csv', getAsCSVBuffer(vacant));
  if (failed) zip.addFile('Failed.csv', getAsCSVBuffer(failed));
  return zip.toBuffer();
};

module.exports.prospectIdentificationProcess = (prospectType, data) => {
  const map = {
    rod,
    ltb,
    oddc,
  };
  return map[prospectType](data);
};
