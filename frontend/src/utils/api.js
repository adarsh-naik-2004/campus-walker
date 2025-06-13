import axios from 'axios';
import toast from 'react-hot-toast';

// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create Axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for adding authorization token
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

// Response interceptor for handling global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    
    // List of public routes that don't require authentication
    const publicRoutes = [
      '/visitors',
      '/public/universities',
      '/university/',
      '/institute/',
      '/building/',
    ];
    
    // Check if this is a public route
    const isPublicRoute = publicRoutes.some(route => requestUrl.includes(route));
    
    // Handle unauthorized errors - but only redirect for protected routes
    if (error.response?.status === 401) {
      if (!isPublicRoute) {
        // Only redirect to admin for protected routes
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/admin';
        toast.error('Session expired. Please login again.');
      } else {
        // For public routes, just show the error without redirecting
        const errorMessage = error.response?.data?.message || 'Registration failed';
        toast.error(errorMessage);
      }
    } else {
      // Handle other error messages
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default api;