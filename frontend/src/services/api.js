import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

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
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const accountAPI = {
  getAccounts: () => api.get('/accounts'),
  getAccountById: (accountId) => api.get(`/accounts/${accountId}`),
  verifyAccount: (account_number) => api.post('/accounts/verify', { account_number }),
};

export const transactionAPI = {
  transfer: (data) => api.post('/transactions/transfer', data),
  getTransactions: (accountId) => api.get(`/transactions/${accountId}`),
};

export const beneficiaryAPI = {
  getBeneficiaries: () => api.get('/beneficiaries'),
  addBeneficiary: (data) => api.post('/beneficiaries', data),
  updateBeneficiary: (beneficiaryId, data) => api.put(`/beneficiaries/${beneficiaryId}`, data),
  deleteBeneficiary: (beneficiaryId) => api.delete(`/beneficiaries/${beneficiaryId}`),
};

export const statementAPI = {
  downloadStatement: (accountId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/statements/${accountId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });
  },
};

export const depositWithdrawalAPI = {
  deposit: (data) => api.post('/operations/deposit', data),
  withdraw: (data) => api.post('/operations/withdraw', data),
};

export const standingOrderAPI = {
  getStandingOrders: () => api.get('/standing-orders'),
  createStandingOrder: (data) => api.post('/standing-orders', data),
  updateStandingOrder: (standingOrderId, data) => api.put(`/standing-orders/${standingOrderId}`, data),
  cancelStandingOrder: (standingOrderId) => api.delete(`/standing-orders/${standingOrderId}`),
  executeStandingOrders: () => api.post('/standing-orders/execute'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getAllAccounts: () => api.get('/admin/accounts'),
  getAllTransactions: () => api.get('/admin/transactions'),
  getAllStandingOrders: () => api.get('/admin/standing-orders'),
  freezeAccount: (accountId) => api.put(`/admin/accounts/${accountId}/freeze`),
  unfreezeAccount: (accountId) => api.put(`/admin/accounts/${accountId}/unfreeze`),
  createAccountForUser: (data) => api.post('/admin/accounts/create', data),
};

export const virtualCardAPI = {
  getVirtualCards: () => api.get('/virtual-cards'),
  createVirtualCard: (data) => api.post('/virtual-cards', data),
  updateVirtualCard: (cardId, data) => api.put(`/virtual-cards/${cardId}`, data),
  deleteVirtualCard: (cardId) => api.delete(`/virtual-cards/${cardId}`),
  generateQRToken: (cardId) => api.post(`/virtual-cards/${cardId}/generate-qr`),
  processPayment: (data) => axios.post(`${API_URL}/virtual-cards/process-payment`, data),
};

export default api;