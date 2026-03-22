import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

export const getNotifications = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${url}notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) return await refreshToken(getNotifications);
    throw new Error(error?.response?.data?.message || "Error al obtener notificaciones");
  }
};

export const getNotificationsBadge = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${url}notifications/badge`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) return await refreshToken(getNotificationsBadge);
    return { count: 0 };
  }
};

export const markNotificationRead = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(`${url}notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) return await refreshToken(markNotificationRead, id);
    throw new Error("Error al marcar notificacion");
  }
};

export const markAllNotificationsRead = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(`${url}notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) return await refreshToken(markAllNotificationsRead);
    throw new Error("Error al marcar notificaciones");
  }
};
