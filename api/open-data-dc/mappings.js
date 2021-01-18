const {assembleAddress, formatOwnerName} = require('./formatting');

const OpenDataDC = {
  ITS: {
    _meta: {
      name: 'Integrated Tax System Public Extract',
      endpoint: 'Property_and_Land_WebMercator/MapServer/53/query',
    },
    SSL: 'SSL',
    PREMISEADD: 'PREMISEADD',
    NBHDNAME: 'NBHDNAME',
    CLASSTYPE: 'CLASSTYPE',
    TAXRATE: 'TAXRATE',
    TOTDUEAMT: 'TOTDUEAMT',
    LASTPAYDT: 'LASTPAYDT',
    HSTDCODE: 'HSTDCODE',
    SALEPRICE: 'SALEPRICE',
    SALEDATE: 'SALEDATE',
    DEEDDATE: 'DEEDDATE',
    OWNERNAME: 'OWNERNAME',
    OWNNAME2: 'OWNNAME2',
    ADDRESS1: 'ADDRESS1',
    ADDRESS2: 'ADDRESS2',
    CITYSTZIP: 'CITYSTZIP',
  },
  RL: {
    _meta: {
      name: 'Record Lots',
      endpoint: 'Property_and_Land_WebMercator/MapServer/35/query',
    },
    RECORDED_AREA_SF: 'RECORDED_AREA_SF',
  },
  TL: {
    _meta: {
      name: 'Tax Lots',
      endpoint: 'Property_and_Land_WebMercator/MapServer/39/query',
    },
    COMPUTED_AREA_SF: 'COMPUTED_AREA_SF',
  },
  MAR: {
    _meta: {
      name: 'Computer Assisted Mass Appraisal - Residential',
      endpoint: 'Property_and_Land_WebMercator/MapServer/25/query',
    },
    LANDAREA: 'LANDAREA',
    NUM_UNITS: 'NUM_UNITS',
    GBA: 'GBA',
  },
  MAC: {
    _meta: {
      name: 'Computer Assisted Mass Appraisal - Commercial',
      endpoint: 'Property_and_Land_WebMercator/MapServer/23/query',
    },
    LANDAREA: 'LANDAREA',
    NUM_UNITS: 'NUM_UNITS',
    LIVING_GBA: 'LIVING_GBA',
  },
  PU: {
    _meta: {
      name: 'Property Use Code List Lookup',
      endpoint: 'Lookup_Tables/MapServer/15/query',
    },
    DESCRIPTION: 'DESCRIPTION',
  },
  AP: {
    _meta: {
      name: 'Address Points',
      endpoint: 'Location_WebMercator/MapServer/0/query',
    },
    ACTIVE_RES_UNITS_COUNT: 'ACTIVE_RES_UNIT_COUNT',
  },
};

const EXPORT_MAPPINGS = {
  SSL: {
    columnName: 'SSL',
    source: 'ITS.SSL',
  },
  Address: {
    columnName: 'Address',
    source: 'ITS.PREMISEADD',
    format: (val) => {
      if (!val) return val;
      const parts = val.split("WASHINGTON DC");
      if (parts.length) {
        return parts[0];
      }
      return val;
    }
  },
  Neighborhood: {
    columnName: 'Neighborhood',
    source: 'ITS.NBHDNAME',
  },
  CLASS: {
    columnName: 'CLASS',
    source: 'ITS.CLASSTYPE',
  },
  CLASS4: {
    columnName: 'CLASS4',
    source: 'ITS.TAXRATE',
    format: (val) => (val === 10 ? 'Y' : 'N'),
  },
  'Out. Tax': {
    columnName: 'Out. Tax',
    source: 'ITS.TOTDUEAMT',
  },
  'Lst Tax Pymt': {
    columnName: 'Lst Tax Pymt',
    source: 'ITS.LASTPAYDT',
  },
  'Computed-Surveyed Area': {
    columnName: 'Computed-Surveyed Area',
    source: 'RL.COMPUTED_AREA_SF',
    alternative: 'TL.COMPUTED_AREA_SF',
  },
  'Tax Land Area': {
    columnName: 'Tax Land Area',
    source: 'MAR.LANDAREA',
    alternative: 'MAC.LANDAREA',
  },
  'Num Units': {
    columnName: 'Num Units',
    source: 'MAR.NUM_UNITS',
    alternative: 'MAC.NUM_UNITS',
  },
  'MAR Num Units': {
    columnName: 'MAR Num Units',
    source: 'AP.ACTIVE_RES_UNIT_COUNT',
  },
  GBA: {
    columnName: 'GBA',
    source: 'MAR.GBA',
    alternative: 'MAC.LIVING_GBA',
  },
  Homestead: {
    columnName: 'Homestead',
    source: 'ITS.HSTDCODE',
    format: (val) => {
      if (val === '1') return 'YES';
      if (val === '2') return 'SENIOR';
      return val;
    },
  },
  'Property Use': {
    columnName: 'Property Use',
    source: 'PU.DESCRIPTION',
    lookup: {attr: 'CODE', value: 'ITS.USECODE'},
  },
  'Sale Price': {
    columnName: 'Sale Price',
    source: 'ITS.SALEPRICE',
  },
  'Sale Date': {
    columnName: 'Sale Date',
    source: 'ITS.SALEDATE',
    format: (val) => val ? (new Date(val)).toISOString() : val,
  },
  'Deed Date': {
    columnName: 'Deed Date',
    source: 'ITS.DEEDDATE',
    format: (val) => val ? (new Date(val)).toISOString() : val,
  },
  'Owner Name 1': {
    columnName: 'Owner Name 1',
    source: 'ITS.OWNERNAME',
    format: formatOwnerName,
  },
  'Owner Name 2': {
    columnName: 'Owner Name 2',
    source: 'ITS.OWNNAME2',
    format: formatOwnerName,
  },
  'Mailing Address': {
    columnName: 'Mailing Address',
    source: ['ITS.ADDRESS1', 'ITS.ADDRESS2', 'ITS.CITYSTZIP'],
    format: assembleAddress,
  },
};

module.exports.OpenDataDC = OpenDataDC;
module.exports.EXPORT_MAPPINGS = EXPORT_MAPPINGS;

console.log(Object.keys(EXPORT_MAPPINGS));