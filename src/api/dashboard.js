import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

export const getDashboardHome = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${url}dashboard/home`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return refreshToken(getDashboardHome);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al cargar el panel de control";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }

    throw new Error("Ocurrió un error inesperado");
  }
};

export const getOverdueActivities = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${url}dashboard/overdue`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return refreshToken(getOverdueActivities);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al cargar actividades vencidas";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }

    throw new Error("Ocurrió un error inesperado");
  }
};
