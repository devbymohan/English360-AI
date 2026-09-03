import api from './api';

export const get${mod.charAt(0).toUpperCase() + mod.slice(1)}Data = async () => {
  const response = await api.get('/' + '${mod}');
  return response.data;
};
