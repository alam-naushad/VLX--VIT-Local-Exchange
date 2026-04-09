import axios from 'axios';

const base =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '') ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: base, // default to localhost for dev
});

// Add a request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
