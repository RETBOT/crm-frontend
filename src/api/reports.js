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
    const message = error?.response?.data?.message || "Error en reportes";
    throw new Error(message);
  }
}

// ============================================
// REPORTES PRINCIPALES
// ============================================

// Helper para formatear filtros correctamente
function formatFilters(filters) {
  return {
    START_DATE: filters.startDate || null,
    END_DATE: filters.endDate || null,
    COMPARE_START_DATE: filters.compareStartDate || null,
    COMPARE_END_DATE: filters.compareEndDate || null,
    BRANCH_IDS: filters.branchIds?.length > 0 ? filters.branchIds : null,
    USER_IDS: filters.userIds?.length > 0 ? filters.userIds : null,
    PRODUCT_IDS: filters.productIds?.length > 0 ? filters.productIds : null,
    STATUS: filters.status || null,
    STAGE_IDS: filters.stageIds?.length > 0 ? filters.stageIds : null,
    MIN_AMOUNT: filters.minAmount || null,
    MAX_AMOUNT: filters.maxAmount || null,
    SEARCH: filters.search || "",
  };
}

export const getDashboardReport = async (filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/dashboard`,
      formatFilters(filters),
      authHeader()
    );
    return res.data;
  });

export const getSalesReport = async (filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/sales`,
      formatFilters(filters),
      authHeader()
    );
    return res.data;
  });

export const getCustomersReport = async (filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/customers`,
      formatFilters(filters),
      authHeader()
    );
    return res.data;
  });

export const getActivitiesReport = async (filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/activities`,
      formatFilters(filters),
      authHeader()
    );
    return res.data;
  });

export const getOpportunitiesReport = async (filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/opportunities`,
      formatFilters(filters),
      authHeader()
    );
    return res.data;
  });

export const getProductsReport = async (filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/products`,
      formatFilters(filters),
      authHeader()
    );
    return res.data;
  });

// ============================================
// EXPORTACIÓN
// ============================================

export const exportReport = async (reportType, format, filters = {}) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/export`,
      {
        REPORT_TYPE: reportType,
        FORMAT: format,
        FILTERS: formatFilters(filters),
      },
      {
        ...authHeader(),
        responseType: "blob",
      }
    );
    return res.data;
  });

// ============================================
// VISTAS GUARDADAS
// ============================================

export const getSavedViews = async () =>
  withRefresh(async () => {
    const res = await axios.get(`${url}reports/saved-views`, authHeader());
    return res.data;
  });

export const createSavedView = async (data) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/saved-views`,
      {
        VIEW_NAME: data.viewName,
        REPORT_TYPE: data.reportType,
        FILTERS: data.filters,
        IS_DEFAULT: data.isDefault || false,
      },
      authHeader()
    );
    return res.data;
  });

export const updateSavedView = async (viewId, data) =>
  withRefresh(async () => {
    const res = await axios.put(
      `${url}reports/saved-views/${viewId}`,
      {
        VIEW_NAME: data.viewName,
        FILTERS: data.filters,
        IS_DEFAULT: data.isDefault,
      },
      authHeader()
    );
    return res.data;
  });

export const deleteSavedView = async (viewId) =>
  withRefresh(async () => {
    const res = await axios.delete(
      `${url}reports/saved-views/${viewId}`,
      authHeader()
    );
    return res.data;
  });

// ============================================
// REPORTES PROGRAMADOS
// ============================================

export const getScheduledReports = async () =>
  withRefresh(async () => {
    const res = await axios.get(`${url}reports/scheduled`, authHeader());
    return res.data;
  });

export const createScheduledReport = async (data) =>
  withRefresh(async () => {
    const res = await axios.post(
      `${url}reports/scheduled`,
      {
        REPORT_TYPE: data.reportType,
        FREQUENCY: data.frequency,
        DAY_OF_WEEK: data.dayOfWeek,
        DAY_OF_MONTH: data.dayOfMonth,
        RECIPIENTS: data.recipients,
        FILTERS: data.filters,
        IS_ACTIVE: data.isActive !== false,
      },
      authHeader()
    );
    return res.data;
  });

export const updateScheduledReport = async (scheduleId, data) =>
  withRefresh(async () => {
    const res = await axios.put(
      `${url}reports/scheduled/${scheduleId}`,
      {
        FREQUENCY: data.frequency,
        DAY_OF_WEEK: data.dayOfWeek,
        DAY_OF_MONTH: data.dayOfMonth,
        RECIPIENTS: data.recipients,
        FILTERS: data.filters,
        IS_ACTIVE: data.isActive,
      },
      authHeader()
    );
    return res.data;
  });

export const deleteScheduledReport = async (scheduleId) =>
  withRefresh(async () => {
    const res = await axios.delete(
      `${url}reports/scheduled/${scheduleId}`,
      authHeader()
    );
    return res.data;
  });