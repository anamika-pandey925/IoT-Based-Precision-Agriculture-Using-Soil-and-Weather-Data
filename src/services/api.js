import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      // Network error / server down
      const serverError = new Error('SERVER_DOWN');
      serverError.code = 'SERVER_DOWN';
      return Promise.reject(serverError);
    }
    const apiError = new Error(
      error.response.data?.message || `HTTP ${error.response.status}`
    );
    apiError.status = error.response.status;
    apiError.code = 'API_ERROR';
    return Promise.reject(apiError);
  }
);

export default api;
export { BASE_URL };
