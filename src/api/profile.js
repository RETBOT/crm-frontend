import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function withRefresh(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      return refreshToken(fn, ...args);
    }

    const message = error?.response?.data?.message || "Error en operacion de perfil";
    throw new Error(message);
  }
}

export const getMyProfile = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}profile/me`, authHeader());
    return response.data;
  });

export const updateMyProfile = async (payload) =>
  withRefresh(async () => {
    const response = await axios.put(`${url}profile/me`, payload, authHeader());
    return response.data;
  });

export const changeMyPassword = async (currentPassword, newPassword) =>
  withRefresh(async () => {
    const response = await axios.put(
      `${url}profile/me/password`,
      { current_password: currentPassword, new_password: newPassword },
      authHeader()
    );
    return response.data;
  });
