import axios, { AxiosError } from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 30000; // 30 seconds

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: TIMEOUT,
});

// Retry logic for failed requests
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    if (!config) {
      return Promise.reject(error);
    }

    // Get retry count from config
    const retryCount = (config as { _retryCount?: number })._retryCount || 0;

    // Check if we should retry (network errors or 5xx server errors)
    const isRetryableError =
      !error.response?.status || // Network error
      (error.response.status >= 500 && error.response.status < 600); // Server error

    const shouldRetry = retryCount < MAX_RETRIES && isRetryableError;

    if (shouldRetry) {
      // Increment retry count
      (config as { _retryCount?: number })._retryCount = retryCount + 1;

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
