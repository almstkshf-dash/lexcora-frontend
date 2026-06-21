import axios from "axios";
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout for file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get cookie
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    let token = getCookie('authToken');

    // Fallback to localStorage if cookie doesn't exist
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }

    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Architectural Guard: Strict Normalization
    if (response.data && typeof response.data === 'object') {
      const body = response.data;

      // 1. Map known alternative keys to 'data'
      if (body.data === undefined || body.data === null) {
        body.data = Array.isArray(body.results) ? body.results :
          Array.isArray(body.items) ? body.items :
            Array.isArray(body.employees) ? body.employees :
              Array.isArray(body.sessions) ? body.sessions :
                Array.isArray(body.tasks) ? body.tasks :
                  body.data;
      }

      // 2. Force 'data' to be an array for collection endpoints
      const url = response.config?.url || "";
      const method = response.config?.method?.toLowerCase() || "";
      const isCollection = method === 'get' && !/\/\d+$/.test(url.split('?')[0]);
      if (isCollection) {
        const isAuthRoute = /\/(auth|login|logout)/i.test(url);
        const isSingleResource = /\/(settings|profile|summary|stats|config|details)/i.test(url);
        if (!isAuthRoute && !isSingleResource) {
          body.data = Array.isArray(body.data) ? body.data : [];
        }
      }
    }
    return response;
  },
  (error) => {
    // If we get a 401 unauthorized error
    if (error.response && error.response.status === 401) {
      const token = getCookie('authToken') || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

      // Only redirect if:
      // 1. There's no token at all (user is not logged in)
      // 2. Or it's an authentication endpoint failing (token refresh, login, etc.)
      const isAuthEndpoint = error.config.url?.includes('/auth/') ||
        error.config.url?.includes('/login') ||
        error.config.url?.includes('/verify');

      if (!token || isAuthEndpoint) {
        // Clear auth data
        if (typeof document !== 'undefined') {
          document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        // If we have a token but got 401, it might be a permission issue
        // Let the component handle it (show error message instead of redirecting)
        console.warn('401 error with valid token - might be a permission issue');
      }
    }
    // Enrich error message with backend response if available
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export default api;
