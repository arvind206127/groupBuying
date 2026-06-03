import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      
      // Don't redirect if we are on a public page
      const publicPaths = ['/', '/login', '/properties', '/blogs', '/articles', '/reviews', '/case-studies', '/faqs', '/contact', '/stay', '/get-in-touch', '/search'];
      const isPublicPath = publicPaths.includes(window.location.pathname) || 
                          window.location.pathname.startsWith('/properties/') ||
                          window.location.pathname.startsWith('/blogs/') ||
                          window.location.pathname.startsWith('/articles/') ||
                          window.location.pathname.startsWith('/reviews') ||
                          window.location.pathname.startsWith('/case-studies/');

      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
