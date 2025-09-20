// src/services/authService.js
import api from './api';
import Cookies from 'js-cookie';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.token) {
      Cookies.set('authToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    Cookies.remove('authToken');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  }
};