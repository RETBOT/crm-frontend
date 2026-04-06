import axios from "axios";
import { logger } from "../utils/logger";

var url = import.meta.env.VITE_API_URL;
const time = import.meta.env.VITE_TIME_REFRESH;
var tokenRefreshTime = time * 60 * 1000; // 10 minutos

// /** FUNCION REFLRESH */
export const refreshToken = async (func, ...args) => {
  const usuario = localStorage.getItem("usr");
  if (!usuario) return;

  try {
    const response = await axios.post(`${url}login/refresh_token`, {
      username: usuario,
    });
    const data = response.data;

    if (!data) {
      throw new Error("No se recibió un token válido");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("expiresIn");

    localStorage.setItem("token", data);
    localStorage.setItem("expiresIn", Date.now() + tokenRefreshTime);

    return await func(...args);
  } catch (error) {
    logger.error("Error al renovar token", error);
  }
};
// /** login */
export const loginUser = async (usuario, password) => {
  try {
    const response = await axios.post(`${url}login/access`, {
      username: usuario,
      password: password,
    });

    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Usuario o contraseña incorrectos"
      );
    }
    else if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }
    else {
      throw new Error("Ocurrió un error inesperado");
    }
  }
};

export const forgotpwd = async (usuario, email) => {
  try {
    const response = await axios.post(`${url}login/forgotpwd`, {
      username: usuario,
      email: email,
    });

    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message ||
          "Usuario o Correo Electrónico incorrectos"
      );
    }
    else if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }
    else {
      throw new Error("Ocurrió un error inesperado");
    }
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${url}login/reset-password`, {
      token,
      newPassword,
    });

    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Error al restablecer la contraseña"
      );
    }
    else if (error.request) {
      throw new Error("No hay conexión con el servidor");
    }
    else {
      throw new Error("Ocurrió un error inesperado");
    }
  }
};
