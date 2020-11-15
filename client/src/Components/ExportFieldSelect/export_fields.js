export const baseFields_old = [
  {label: 'Owner Label Name', value: 'Owner Label Name'},
  {label: 'Town', value: 'Town'},
  {label: 'Postal Code', value: 'Postal Code'},
  {label: 'City', value: 'City'},
  {label: 'Sale Amt', value: 'Sale Amt'},
  {label: 'Deed Record Date', value: 'Deed Record Date'},
  {label: 'Bldg Sq Ft Total', value: 'Bldg Sq Ft Total'},
  {label: 'Address', value: 'Address'},
  {label: 'Full Address', value: 'Full Address'},
  {label: 'Street View Url', value: 'Street View Url'},
  {label: 'State', value: 'State'},
  {label: 'City', value: 'City'},
  {label: 'Zip Code', value: 'Zip Code'},
  {label: 'Confidence Level', value: 'Confidence Level'},
  {label: 'Zone Description', value: 'Zone Description'},
  {label: 'Zone', value: 'Zone'},
  {label: 'Owner Name', value: 'Owner Name'},
  {label: 'Owner Address', value: 'Owner Address'},
  {label: 'Owner City Zip', value: 'Owner City Zip'},
  {label: 'Sale Price', value: 'Sale Price'},
  {label: 'Sale Date', value: 'Sale Date'},
  {label: 'Current Price (Land)', value: ''},
  {label: 'Current Price (Improvements)', value: ''},
  {label: 'Current Price (Total)', value: ''},
  {label: 'Proposed Price (Land)', value: ''},
  {label: 'Proposed Price (Improvements)', value: ''},
  {label: 'Proposed Price (Total)', value: ''},
  {label: 'Use Code', value: ''},
  {label: 'Use Title', value: ''},
  {label: 'Use Description', value: ''},
];

export const baseFields = baseFields_old.map((x) => x.label);

export const zillowFields_old = [
  {label: 'Zestimate', value: 'Zestimate'},
  {label: 'Zestimate Last Update', value: 'Zestimate Last Update'},
  {label: 'Zestimate (High)', value: 'Zestimate (High)'},
  {label: 'Zestimate (Low)', value: 'Zestimate (Low)'},
];

export const zillowFields = zillowFields_old.map((x) => x.label.toLowerCase());

export const getExportFieldList = (jobType, context) => {
  let fields = [];
  if (jobType === 'zone') {
    fields = [...fields, ...baseFields];
    if (context.searchZillow) {
      fields = [...fields, zillowFields];
    }
  } else if (jobType === 'tpsc') {
    fields = [...fields];
  }
  return fields;
};
