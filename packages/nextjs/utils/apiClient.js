import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.ALCHEMY_BASE_URL, // Load base URL from environment variables
  timeout: 10000,
});

const MAX_RETRIES = 5;

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    if (response && response.status === 429 && config && !config._retryCount) {
      config._retryCount = 0;
    }

    if (response && response.status === 429 && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      const retryAfter = Math.pow(2, config._retryCount) * 100; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return apiClient(config);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
