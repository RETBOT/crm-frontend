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

    const message = error?.response?.data?.message || "Error en operación administrativa";
    throw new Error(message);
  }
}

export const getAdminRoles = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}admin/roles`, authHeader());
    return response.data;
  });

export const getAdminUsers = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}admin/users`, authHeader());
    return response.data;
  });

export const createAdminUser = async (payload) =>
  withRefresh(async () => {
    const response = await axios.post(`${url}admin/users`, payload, authHeader());
    return response.data;
  });

export const updateAdminUserRoles = async (userId, roleIds) =>
  withRefresh(async () => {
    const response = await axios.put(
      `${url}admin/users/${userId}/roles`,
      { role_ids: roleIds },
      authHeader()
    );
    return response.data;
  });

export const getAdminPermissions = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}admin/permissions`, authHeader());
    return response.data;
  });

export const createAdminRole = async (payload) =>
  withRefresh(async () => {
    const response = await axios.post(`${url}admin/roles`, payload, authHeader());
    return response.data;
  });

export const updateAdminRolePermissions = async (roleId, permissionIds) =>
  withRefresh(async () => {
    const response = await axios.put(
      `${url}admin/roles/${roleId}/permissions`,
      { permission_ids: permissionIds },
      authHeader()
    );
    return response.data;
  });

export const deleteAdminRole = async (roleId) =>
  withRefresh(async () => {
    const response = await axios.delete(`${url}admin/roles/${roleId}`, authHeader());
    return response.data;
  });

export const getAdminBranches = async () =>
  withRefresh(async () => {
    const response = await axios.get(`${url}admin/branches`, authHeader());
    return response.data;
  });

export const getAdminRoutes = async (branchIds = []) =>
  withRefresh(async () => {
    const query = branchIds.length > 0 ? `?branch_ids=${branchIds.join(",")}` : "";
    const response = await axios.get(`${url}admin/routes${query}`, authHeader());
    return response.data;
  });

export const getAdminUserScope = async (userId) =>
  withRefresh(async () => {
    const response = await axios.get(`${url}admin/users/${userId}/scope`, authHeader());
    return response.data;
  });

export const updateAdminUserScope = async (userId, payload) =>
  withRefresh(async () => {
    const response = await axios.put(`${url}admin/users/${userId}/scope`, payload, authHeader());
    return response.data;
  });

export const createAdminPermission = async (payload) =>
  withRefresh(async () => {
    const response = await axios.post(`${url}admin/permissions`, payload, authHeader());
    return response.data;
  });

export const updateAdminPermission = async (permissionId, payload) =>
  withRefresh(async () => {
    const response = await axios.put(`${url}admin/permissions/${permissionId}`, payload, authHeader());
    return response.data;
  });

export const deleteAdminPermission = async (permissionId) =>
  withRefresh(async () => {
    const response = await axios.delete(`${url}admin/permissions/${permissionId}`, authHeader());
    return response.data;
  });
