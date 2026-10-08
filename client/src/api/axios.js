import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, headers, data } = error.response;

      if (status === 429) {
        const retryAfter = headers['retry-after'] || '60';
        toast.error(`Too many requests. Please wait ${retryAfter} seconds before trying again.`);
      } else if (status === 500) {
        toast.error(data?.message || 'Server error occurred. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);
