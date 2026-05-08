import api from './api';

export const usersService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    const users = response.data.data || response.data.users || response.data;
    return users;
  },
};
