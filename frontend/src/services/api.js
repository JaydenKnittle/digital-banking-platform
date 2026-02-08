import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const accountAPI = {
  getAccounts: () => api.get('/accounts'),
  getAccountById: (accountId) => api.get(`/accounts/${accountId}`),
};

export const transactionAPI = {
  transfer: (data) => api.post('/transactions/transfer', data),
  getTransactions: (accountId) => api.get(`/transactions/${accountId}`),
};

export default api;