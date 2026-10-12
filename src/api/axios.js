import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Clean trailing slashes and ensure /api is properly appended
let cleanBaseURL = rawBaseURL.trim().replace(/\/+$/, '');
if (!cleanBaseURL.endsWith('/api')) {
  cleanBaseURL = `${cleanBaseURL}/api`;
}

const API = axios.create({
  baseURL: cleanBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT Token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sharemymeal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
