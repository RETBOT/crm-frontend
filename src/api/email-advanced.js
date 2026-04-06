import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function withRefresh(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      return refreshToken(fn, ...args);
    }
    const message = error?.response?.data?.message || "Error en operacion de email avanzado";
    throw new Error(message);
  }
}

export const getEmailTemplates = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}email-advanced/templates`, authHeader());
    return response.data;
  });

export const createEmailTemplate = async (payload) =>
  withRefresh(async () => {
    const response = await axios.post(`${url}email-advanced/templates`, payload, authHeader());
    return response.data;
  });

export const updateEmailTemplate = async (id, payload) =>
  withRefresh(async () => {
    const response = await axios.put(`${url}email-advanced/templates/${id}`, payload, authHeader());
    return response.data;
  });

export const deleteEmailTemplate = async (id) =>
  withRefresh(async () => {
    const response = await axios.delete(`${url}email-advanced/templates/${id}`, authHeader());
    return response.data;
  });

export const sendWithTemplate = async (payload) =>
  withRefresh(async () => {
    const response = await axios.post(`${url}email-advanced/send-with-template`, payload, authHeader());
    return response.data;
  });

export const getSignature = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}email-advanced/signature`, authHeader());
    return response.data;
  });

export const saveSignature = async (signatureHtml) =>
  withRefresh(async () => {
    const response = await axios.put(`${url}email-advanced/signature`, { signatureHtml }, authHeader());
    return response.data;
  });

export const getTrackingStats = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}email-advanced/tracking-stats`, authHeader());
    return response.data;
  });
