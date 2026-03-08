import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // ❌ ne pas envoyer token pour login/register
  if (
    token &&
    !config.url.includes('/auth/login') &&
    !config.url.includes('/auth/register')&&
    !config.url.includes('/auth/create-admin')
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//const createAdmin = async () => {
//  axios.post("http://localhost:8080/api/auth/create-admin")
//.then(res => console.log(res.data))
//.catch(err => console.error(err.response?.data || err));
//};


// Authentication
export const login = (username, password) => {
  //createAdmin();
  return api.post('/auth/login', { username, password });
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// Users (Admin)
export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const createUser = (userData) => {
  return api.post('/admin/users', userData);
};

export const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

// Credits
export const createCreditRequest = (creditData) => {
  return api.post('/credits', creditData);
};

export const getUserCredits = () => {
  return api.get('/credits/user');
};

export const getAllCredits = () => {
  return api.get('/credits/all');
};

export const updateCreditStatus = (id, statusData) => {
  return api.put(`/credits/${id}/status`, statusData);
};

export const getStatistics = () => {
  return api.get('/credits/statistics');
};

export default api;
