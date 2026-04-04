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
        PRIORITY: filtros.PRIORITY || "",
        OWNER_USER_ID: filtros.OWNER_USER_ID ?? null,
        DUE_FROM: filtros.DUE_FROM || null,
        DUE_TO: filtros.DUE_TO || null,
        SORT_BY: filtros.SORT_BY || "status",
        SORT_DIR: filtros.SORT_DIR || "ASC",
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

export const completarActividad = async (ACTIVITY_ID, STATUS, CHECK_IN_LAT, CHECK_IN_LON, NOTES) => {
  const token = localStorage.getItem("token");
  try {
    const payload = { ACTIVITY_ID, STATUS };
    if (CHECK_IN_LAT != null && CHECK_IN_LON != null) {
      payload.CHECK_IN_LAT = CHECK_IN_LAT;
      payload.CHECK_IN_LON = CHECK_IN_LON;
    }
    if (NOTES) {
      payload.NOTES = NOTES;
    }
    const response = await axios.post(
      `${url}cn/actividades_completar`,
      payload,
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
      return await refreshToken(completarActividad, ACTIVITY_ID, STATUS, CHECK_IN_LAT, CHECK_IN_LON, NOTES);
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

export const getActivityUsers = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${url}cn/actividades_usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(getActivityUsers);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener usuarios";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};

export const getActividadesCheckins = async (filtros = {}) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${url}cn/actividades_checkins`,
      {
        FROM_DATE: filtros.FROM_DATE || null,
        TO_DATE: filtros.TO_DATE || null,
        USER_ID: filtros.USER_ID || null,
        TYPE: filtros.TYPE || null,
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
      return await refreshToken(getActividadesCheckins, filtros);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener check-ins";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexion con el servidor");
    }

    throw new Error("Ocurrio un error inesperado");
  }
};
