import api from './api';

export const achievementService = {
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data?.data;
  },
};
