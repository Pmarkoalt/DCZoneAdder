import OpenDataContextFields from './oddc/OpenDataContextFields';
import ZoneContextFields from './zone/ZoneContextFields';
export const getContextFieldsComponent = (jobType) => {
  const map = {
    'open-data-dc': OpenDataContextFields,
    zone: ZoneContextFields,
  };
  return map[jobType];
};
