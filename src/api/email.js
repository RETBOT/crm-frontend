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

    const message = error?.response?.data?.message || "Error en operacion de correo";
    throw new Error(message);
  }
}

export const connectEmail = async (provider, code, redirectUri) =>
  withRefresh(async () => {
    const response = await axios.post(
      `${url}email/connect`,
      { provider, code, redirectUri },
      authHeader()
    );
    return response.data;
  });

export const sendEmail = async (payload) =>
  withRefresh(async () => {
    const response = await axios.post(
      `${url}email/send`,
      payload,
      authHeader()
    );
    return response.data;
  });

export const getEmailHistory = async (params = {}) =>
  withRefresh(async () => {
    const response = await axios.get(`${url}email/history`, {
      ...authHeader(),
      params,
    });
    return response.data;
  });

export const getConnectedAccounts = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}email/accounts`, authHeader());
    return response.data;
  });

export const disconnectEmail = async (provider) =>
  withRefresh(async () => {
    const response = await axios.delete(
      `${url}email/disconnect/${provider}`,
      authHeader()
    );
    return response.data;
  });

export const getOAuthStatus = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}email/oauth-status`, authHeader());
    return response.data;
  });
