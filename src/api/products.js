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

export const getProducts = async (filtros = {}) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/productos`, {
      SEARCH: filtros.SEARCH || "",
      STATUS: filtros.STATUS || "",
      CATEGORY_ID: filtros.CATEGORY_ID ?? null,
      SORT_BY: filtros.SORT_BY || "product_name",
      SORT_DIR: filtros.SORT_DIR || "ASC",
      NPAG: filtros.NPAG || 1,
      TPAG: filtros.TPAG || 20,
    }, authHeader());
    return res.data;
  });

export const productsAbc = async (payload) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/productos_abc`, payload, authHeader());
    return res.data;
  });

export const getProductCategories = async () =>
  withRefresh(async () => {
    const res = await axios.get(`${url}cn/productos_categorias`, authHeader());
    return res.data;
  });

export const productCategoriesAbc = async (payload) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/productos_categorias_abc`, payload, authHeader());
    return res.data;
  });

export const getProductPriceHistory = async (productId) =>
  withRefresh(async () => {
    const res = await axios.get(`${url}cn/productos/${productId}/precio_historial`, authHeader());
    return res.data;
  });
