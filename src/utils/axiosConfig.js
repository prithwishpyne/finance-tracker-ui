import axios from "axios";
import * as config from "./config.js";

const axiosInstance = axios.create({
  baseURL: `http://${config.URL}:${config.PORT}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
