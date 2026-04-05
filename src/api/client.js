import axios from "axios";
import { refreshToken } from "./auth";
import { logger } from "../utils/logger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

api.interceptors.response.use(
  (response) => response,
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

export default api;
