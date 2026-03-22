import axios from "axios";

var url = import.meta.env.VITE_API_URL;
import { refreshToken } from "./auth";

export const getActividades = async (filtros = {}) => {
  const token = localStorage.getItem("token");
  const CNUSERID = localStorage.getItem("usr");
  try {
    const response = await axios.post(
      `${url}cn/actividades`,
      {
        CNUSERID,
        CUSTOMER_ID: filtros.CUSTOMER_ID ?? null,
        STATUS: filtros.STATUS || "",
        TYPE: filtros.TYPE || "",
        SEARCH: filtros.SEARCH || "",
        NPAG: filtros.NPAG || 1,
        TPAG: filtros.TPAG || 20,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(getActividades, filtros);
    }

    if (status) {
      const msg = error.response.data?.message || error.response.data?.msg || "Error al obtener actividades";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};

export const crearActividad = async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(`${url}cn/actividades_crear`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(crearActividad, payload);
    }

    if (status) {
      const msg = error.response.data?.message || error.response.data?.msg || "Error al crear actividad";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};

export const actualizarActividad = async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(`${url}cn/actividades_actualizar`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(actualizarActividad, payload);
    }

    if (status) {
      const msg = error.response.data?.message || error.response.data?.msg || "Error al actualizar actividad";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};

export const completarActividad = async (ACTIVITY_ID, STATUS) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${url}cn/actividades_completar`,
      { ACTIVITY_ID, STATUS },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(completarActividad, ACTIVITY_ID, STATUS);
    }

    if (status) {
      const msg = error.response.data?.message || error.response.data?.msg || "Error al completar actividad";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};

export const getTiposActividad = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${url}cn/actividades_tipos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(getTiposActividad);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener tipos de actividad";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};
