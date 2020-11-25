import ZoneContextFields from './zone/ZoneContextFields';
export const getContextFieldsComponent = (jobType) => {
  const map = {
    zone: ZoneContextFields,
  };
  return map[jobType];
};
