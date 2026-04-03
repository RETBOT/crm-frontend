import axios from "axios";

var url = import.meta.env.VITE_API_URL;
const time = import.meta.env.VITE_TIME_REFRESH;
var tokenRefreshTime = time * 60 * 1000; // 10 minutos

// /** FUNCION REFLRESH */
export const refreshToken = async (func, ...args) => {
  const usuario = localStorage.getItem("usr");
  const password = localStorage.getItem("pwd");
  console.log("renovando token")
  // Evitar hacer la petición si no hay credenciales almacenadas
  if (!usuario || !password) return;

  console.log(usuario)
  console.log(password)
  try {
    const response = await axios.post(`${url}login/refresh_token`, {
      username: usuario,
      password: password,
    });
    console.log(response);
    const data = response.data;

    if (!data) {
      throw new Error("No se recibió un token válido");
    }
    // remueve el token anterior
    localStorage.removeItem("token");
    localStorage.removeItem("expiresIn");

    // Almacena el nuevo token y la fecha de expiración
    localStorage.setItem("token", data);
    localStorage.setItem("expiresIn", Date.now() + tokenRefreshTime);

    return await func(...args); // Llama a la función original con los argumentos proporcionados
  } catch (error) {
    console.error("Error al renovar token", error);
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
      console.error("Eloginrror en :", error.response.data);
      throw new Error(
        error.response.data.message || "Usuario o contraseña incorrectos"
      );
    }
    // Si el error es de conexión o servidor caído
    else if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }
    // Si es otro tipo de error inesperado
    else {
      console.error("Error desconocido:", error.message);
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
      console.error("Eloginrror en :", error.response.data);
      throw new Error(
        error.response.data.message ||
          "Usuario o Correo Electrónico incorrectos"
      );
    }
    else if (error.request) {
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }
    else {
      console.error("Error desconocido:", error.message);
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
      console.error("No hay respuesta del servidor:", error.request);
      throw new Error("No hay conexión con el servidor");
    }
    else {
      console.error("Error desconocido:", error.message);
      throw new Error("Ocurrió un error inesperado");
    }
  }
};
