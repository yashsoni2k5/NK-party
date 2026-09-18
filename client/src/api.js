import axios from 'axios';

const api = axios.create({
  // Fallback to your deployed backend URL if VITE_API_URL isn't explicitly set
  baseURL: import.meta.env.VITE_API_URL || 'https://nk-party.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
