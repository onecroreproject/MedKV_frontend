import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
axiosInstance.interceptors.request.use(
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

// Add a response interceptor to handle Session Revoked logic globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data && error.response.data.message === 'SESSION_REVOKED') {
        // Only trigger this if we are not already on the login page
        if (!window.location.pathname.includes('/student/login')) {
          localStorage.removeItem('token');
          alert('You have been logged out because your account was accessed from another device.');
          window.location.href = '/student/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
