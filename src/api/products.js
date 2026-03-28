import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const withRefresh = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    if (error?.response?.status === 401) return await refreshToken(() => fn());
    const msg = error.response?.data?.msg || error.response?.data?.message || "Error en productos";
    throw new Error(msg);
  }
};

export const getProducts = async () =>
  withRefresh(async () => {
    const res = await axios.get(`${url}cn/productos`, authHeader());
    return res.data;
  });

export const productsAbc = async (payload) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/productos_abc`, payload, authHeader());
    return res.data;
  });
