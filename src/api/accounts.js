import axios from "axios";

var url = import.meta.env.VITE_API_URL;
import { refreshToken } from "./auth";

export const getSucursales = async (DSC) => {
  // Obtener el token
  const token = localStorage.getItem("token");
  const usr = localStorage.getItem("usr");
  try { 
    const response = await axios.post(`${url}cn/sucursal`, {
        CNUSERID: usr, 
        DESCRIPCION: DSC
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      console.log("Token expirado. Renovando...");
      return await refreshToken(getSucursales, DSC);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener las sucursales";
      console.error("Error:", msg);
      throw new Error(msg);
    }

    if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }

    console.error("Error desconocido:", error.message);
    throw new Error("Ocurrió un error inesperado");
  }
};

export const getRutas = async (DSC) => {
  // Obtener el token
  const token = localStorage.getItem("token");
  const usr = localStorage.getItem("usr");
  try { 
    const response = await axios.post(`${url}cn/rutas`, {
        CNUSERID: usr, 
        DESCRIPCION: DSC
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      console.log("Token expirado. Renovando...");
      return await refreshToken(getRutas, DSC);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener las rutas";
      console.error("Error:", msg);
      throw new Error(msg);
    }

    if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }

    console.error("Error desconocido:", error.message);
    throw new Error("Ocurrió un error inesperado");
  }
};

// /** Clientes */
export const getClientes = async (CLIENTEID, NOMBRECLI, SUCURSAL, ESTATUS, RUTA, PAGE, NUMCLI, TIPO) => {
  // Obtener el token
  const token = localStorage.getItem("token");
  const CNUSERID = localStorage.getItem("usr");
  try { 
    const response = await axios.post(`${url}cn/clientes`, {
        CNUSERID: CNUSERID, 
        CLIENTEID: CLIENTEID,
        NOMBRECLI: NOMBRECLI,
        SUCURSAL: SUCURSAL,
        ESTATUS: ESTATUS, 
        RUTA: RUTA,
        NPAG: PAGE,
        TPAG: NUMCLI,
        TIPO: TIPO,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      console.log("Token expirado. Renovando...");
      return await refreshToken(getClientes, CLIENTEID, NOMBRECLI, SUCURSAL, ESTATUS, RUTA, PAGE, NUMCLI, TIPO);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener los clientes";
      console.error("Error:", msg);
      throw new Error(msg);
    }

    if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }

    console.error("Error desconocido:", error.message);
    throw new Error("Ocurrió un error inesperado");
  }
};

// /** Clientes */
export const getContactos = async (CLIENTEID) => {
  // Obtener el token
  const token = localStorage.getItem("token");
  try { 
    const response = await axios.post(`${url}cn/contactos`, {
        CLIENTEID: CLIENTEID
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      console.log("Token expirado. Renovando...");
      return await refreshToken(getContactos, CLIENTEID);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener los datos";
      console.error("Error:", msg);
      throw new Error(msg);
    }

    if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }

    console.error("Error desconocido:", error.message);
    throw new Error("Ocurrió un error inesperado");
  }
};

// /** Clientes  ABC */ 
export const contactos_ABC = async (CLIENTEID, CONTACTOID, NOMBRE, APATERNO, AMATERNO, TELEFONO, EXTENSION, PUESTOID, COMENTARIOS, WHATSAPP, EMAIL, TIPO) => {

  // Obtener el token
  const token = localStorage.getItem("token");
  try { 
    const response = await axios.post(`${url}cn/contactos_abc`, {
        CLIENTEID: CLIENTEID,
        CONTACTOID: CONTACTOID,
        NOMBRE: NOMBRE,
        APATERNO: APATERNO,
        AMATERNO: AMATERNO,
        TELEFONO: TELEFONO,
        EXTENSION: EXTENSION,
        PUESTOID: PUESTOID,
        COMENTARIOS: COMENTARIOS,
        WHATSAPP: WHATSAPP,
        EMAIL: EMAIL,
        TIPO: TIPO
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;

  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      console.log("Token expirado. Renovando...");
      return await refreshToken(contactos_ABC, CLIENTEID, CONTACTOID, NOMBRE, APATERNO, AMATERNO, TELEFONO, EXTENSION, PUESTOID, COMENTARIOS, WHATSAPP, EMAIL, TIPO);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener los datos";
      console.error("Error:", msg);
      throw new Error(msg);
    }

    if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }

    console.error("Error desconocido:", error.message);
    throw new Error("Ocurrió un error inesperado");
  }
};

export const getPuestos = async (DSC = "") => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${url}cn/puestos`,
      { DESCRIPCION: DSC },
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
      return await refreshToken(getPuestos, DSC);
    }

    if (status) {
      const msg = error.response.data?.message || "Error al obtener los puestos";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }

    throw new Error("Ocurrió un error inesperado");
  }
};

export const clientes_ABC = async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(`${url}cn/clientes_abc`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return await refreshToken(clientes_ABC, payload);
    }

    if (status) {
      const msg = error.response.data?.message || error.response.data?.msg || "Error al guardar cliente/prospecto";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }

    throw new Error("Ocurrió un error inesperado");
  }
};

export const convertirProspecto = async (CLIENTEID) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${url}cn/prospecto_convertir`,
      { CLIENTEID },
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
      return await refreshToken(convertirProspecto, CLIENTEID);
    }

    if (status) {
      const msg = error.response.data?.message || error.response.data?.msg || "Error al convertir prospecto";
      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }

    throw new Error("Ocurrió un error inesperado");
  }
};
