import CryptoJS from "crypto-js";

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const expiresIn = localStorage.getItem("expiresIn");
  if (!token || !expiresIn) return false;
  return Date.now() < parseInt(expiresIn);
};

export const login = (data, recordarme) => {

  localStorage.setItem("usr", data.user_name);
  localStorage.setItem("dsc", data.user_dsc);
  localStorage.setItem("idsuc", data.id_sucursal);
  localStorage.setItem("suc", data.sucursal);
  localStorage.setItem("msuc", data.multi_suc);
  localStorage.setItem("token", data.token);
  localStorage.setItem("permissions", JSON.stringify(Array.isArray(data.permissions) ? data.permissions : []));
  localStorage.setItem("expiresIn", Date.now() + 3600000);

  localStorage.setItem("recordarme", recordarme ? "true" : "false");
}

export const logout = () => {
  
  const recuerdame = localStorage.getItem("recordarme") === "true";
  if (!recuerdame) {
    localStorage.removeItem("usr");
    localStorage.removeItem("recordarme");
  }
  localStorage.removeItem("dsc");
  localStorage.removeItem("idsuc");
  localStorage.removeItem("suc");
  localStorage.removeItem("msuc");
  localStorage.removeItem("token");
  localStorage.removeItem("permissions");
  localStorage.removeItem("expiresIn");
};

export const getPermissions = () => {
  try {
    const raw = localStorage.getItem("permissions");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const hasPermission = (permission) => {
  return getPermissions().includes(permission);
};

export const hasAnyPermission = (permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) return true;
  const userPermissions = getPermissions();
  return permissions.some((permission) => userPermissions.includes(permission));
};

export const encryptData = (data) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  const hash = CryptoJS.SHA256(secretKey);
  const key = CryptoJS.enc.Hex.parse(hash.toString().substring(0, 64));
  const iv = CryptoJS.enc.Hex.parse(hash.toString().substring(64, 96));
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}
