import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const withRefresh = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => fn());
    }
    const msg = error.response?.data?.msg || error.response?.data?.message || "Error en oportunidades";
    throw new Error(msg);
  }
};

export const getOpportunities = async (filtros = {}) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/oportunidades`, {
      CUSTOMER_ID: filtros.CUSTOMER_ID ?? null,
      STATUS: filtros.STATUS || "",
      STAGE_ID: filtros.STAGE_ID ?? null,
      SEARCH: filtros.SEARCH || "",
      NPAG: filtros.NPAG || 1,
      TPAG: filtros.TPAG || 50,
    }, authHeader());
    return res.data;
  });

export const getOpportunityItems = async (opportunityId) =>
  withRefresh(async () => {
    const res = await axios.get(`${url}cn/oportunidades/${opportunityId}/items`, authHeader());
    return res.data;
  });

export const getOpportunitiesByCustomer = async (customerId) =>
  withRefresh(async () => {
    const res = await axios.get(`${url}cn/oportunidades_by_customer/${customerId}`, authHeader());
    return res.data;
  });

export const createOpportunity = async (payload) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/oportunidades_crear`, payload, authHeader());
    return res.data;
  });

export const updateOpportunity = async (payload) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/oportunidades_actualizar`, payload, authHeader());
    return res.data;
  });

export const advanceStage = async (opportunityId, stageId) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/oportunidades_avanzar`, { OPPORTUNITY_ID: opportunityId, STAGE_ID: stageId }, authHeader());
    return res.data;
  });

export const setOpportunityStatus = async (opportunityId, status, lostReason = "") =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/oportunidades_status`, { OPPORTUNITY_ID: opportunityId, STATUS: status, LOST_REASON: lostReason }, authHeader());
    return res.data;
  });

export const reopenOpportunity = async (opportunityId) =>
  withRefresh(async () => {
    const res = await axios.post(`${url}cn/oportunidades_reabrir`, { OPPORTUNITY_ID: opportunityId }, authHeader());
    return res.data;
  });

export const getPipelines = async () =>
  withRefresh(async () => {
    const res = await axios.get(`${url}cn/pipelines`, authHeader());
    return res.data;
  });
