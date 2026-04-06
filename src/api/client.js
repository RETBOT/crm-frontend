import axios from "axios";
import { refreshToken } from "./auth";
import { logger } from "../utils/logger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

const responseCache = new Map();
const CACHE_TTL = 30000;

function cacheKey(config) {
  return `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  async (response) => {
    const key = cacheKey(response.config);
    if (response.config.method === "get" || response.config.method === "post") {
      responseCache.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const usuario = localStorage.getItem("usr");
      if (usuario) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}login/refresh_token`,
            { username: usuario }
          );
          const newToken = response.data;
          if (newToken) {
            localStorage.setItem("token", newToken);
            localStorage.setItem("expiresIn", Date.now() + 3600000);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          logger.error("Error al renovar token");
          localStorage.removeItem("token");
          localStorage.removeItem("expiresIn");
          window.location.href = "/auth/sign-in";
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/auth/sign-in";
      }
    }

    return Promise.reject(error);
  }
);

export function clearCache() {
  responseCache.clear();
}

export default api;
