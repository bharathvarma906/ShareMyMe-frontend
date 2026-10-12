import axios from 'axios';

// Default to the deployed Render backend URL so the app works out-of-the-box
// both in production on Render and whenever VITE_API_BASE_URL is not explicitly set
const DEFAULT_API_URL = 'https://sharemyme-backend.onrender.com/api';
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;

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
