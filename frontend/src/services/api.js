import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, remove it
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/share/')) {
        localStorage.removeItem('vault_token');
        localStorage.removeItem('vault_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
