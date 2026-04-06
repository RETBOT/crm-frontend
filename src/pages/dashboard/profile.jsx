import React, { useEffect, useState } from "react";
import { FiUser, FiShield, FiLock, FiEdit2, FiSave, FiX, FiCheck, FiClock, FiMapPin, FiMail, FiTrash2, FiLink } from "react-icons/fi";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../../api/profile";
import { getConnectedAccounts, disconnectEmail } from "../../api/email";
import { ConnectEmailModal } from "../../components/email/ConnectEmailModal";
import { PERMISSION_GROUPS } from "../../utils/permissions-config";
import { Notification } from "../../components/notifications/notification";

export function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification((n) => ({ ...n, show: false })), 3000);
  };

  const loadEmailAccounts = async () => {
    setLoadingEmails(true);
    try {
      const data = await getConnectedAccounts();
      setEmailAccounts(data.accounts || []);
    } catch (err) {
      console.error("Error al cargar cuentas de correo:", err);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`¿Desconectar tu cuenta de ${provider === "google" ? "Gmail" : "Outlook"}?`)) return;
    try {
      await disconnectEmail(provider);
      showNotification("Cuenta de correo desconectada");
      loadEmailAccounts();
    } catch (err) {
      showNotification(err.message || "Error al desconectar", "error");
    }
  };

  const handleEmailConnected = () => {
    showNotification("Cuenta de correo conectada exitosamente");
    setShowConnectModal(null);
    loadEmailAccounts();
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setEditForm({ display_name: data.display_name || "", email: data.email || "" });
    } catch (err) {
      setError(err.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadEmailAccounts();
  }, []);

  const handleSaveProfile = async () => {
    setError("");
    setMessage("");
    if (!editForm.display_name || editForm.display_name.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    try {
      await updateMyProfile(editForm);
      setMessage("Perfil actualizado correctamente");
      setEditing(false);
      showNotification("Perfil actualizado correctamente");
      await loadProfile();
    } catch (err) {
      setError(err.message || "Error al actualizar perfil");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setMessage("");
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setError("Todos los campos son requeridos");
      return;
    }
    if (passwordForm.new.length < 6) {
      setError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setError("Las contrasenas no coinciden");
      return;
    }
    try {
      await changeMyPassword(passwordForm.current, passwordForm.new);
      setMessage("Contrasena actualizada correctamente");
      setPasswordForm({ current: "", new: "", confirm: "" });
      showNotification("Contrasena actualizada correctamente");
    } catch (err) {
      setError(err.message || "Error al cambiar contrasena");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const permMap = {};
  if (profile?.permissions) {
    profile.permissions.forEach((key) => { permMap[key] = key; });
  }

  const tabs = [
    { id: "profile", label: "Mi Perfil", icon: <FiUser /> },
    { id: "email", label: "Correo", icon: <FiMail /> },
    { id: "security", label: "Seguridad", icon: <FiLock /> },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-gray-500">
        {error || "No se pudo cargar el perfil"}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
        <p className="text-gray-600 mb-6">Gestiona tu informacion personal y seguridad</p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-3 sm:px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setMessage("");
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Mi Perfil */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0">
                {getInitials(profile.display_name)}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Nombre completo</label>
                      <input
                        className="border rounded p-2 w-full text-sm"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm((p) => ({ ...p, display_name: e.target.value }))}
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email</label>
                      <input
                        className="border rounded p-2 w-full text-sm"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                        onClick={handleSaveProfile}
                      >
                        <FiSave size={14} /> Guardar
                      </button>
                      <button
                        className="flex items-center gap-1 border px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-50"
                        onClick={() => {
                          setEditing(false);
                          setEditForm({ display_name: profile.display_name || "", email: profile.email || "" });
                        }}
                      >
                        <FiX size={14} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{profile.display_name}</h2>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                    {profile.email && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{profile.email}</p>
                    )}
                    <button
                      className="flex items-center gap-1 mt-3 text-blue-600 text-sm hover:text-blue-700"
                      onClick={() => setEditing(true)}
                    >
                      <FiEdit2 size={14} /> Editar perfil
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 border-t pt-4 sm:pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Informacion</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Sucursal</p>
                      <p className="text-sm text-gray-800">
                        {profile.branch_name || "Sin sucursal asignada"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCheck className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Multi-sucursal</p>
                      <p className="text-sm text-gray-800">
                        {profile.is_multi_branch ? "Si" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiClock className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Ultimo acceso</p>
                      <p className="text-sm text-gray-800">{formatDate(profile.last_login_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Roles asignados</h3>
                {profile.roles && profile.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role) => (
                      <span
                        key={role.role_id}
                        className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {role.role_name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin roles asignados</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Correo */}
        {activeTab === "email" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Cuentas de correo conectadas</h3>
              </div>

              <div className="space-y-3 mb-6">
                {loadingEmails ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                ) : emailAccounts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No tienes cuentas de correo conectadas. Conecta tu Gmail o Outlook para enviar correos desde el CRM.
                  </p>
                ) : (
                  emailAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            account.provider === "google"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {account.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{account.email}</p>
                          <p className="text-xs text-gray-500">
                            {account.provider === "google" ? "Gmail" : "Outlook"}
                            {account.is_active ? "" : " (Desconectada)"}
                            {account.last_used_at
                              ? ` · Último uso: ${new Date(account.last_used_at).toLocaleDateString("es-MX")}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(account.provider)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                        title="Desconectar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Conectar nueva cuenta</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowConnectModal("google")}
                    className="flex items-center gap-2 border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-medium">Conectar Gmail</span>
                  </button>
                  <button
                    onClick={() => setShowConnectModal("microsoft")}
                    className="flex items-center gap-2 border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#00a4ef" d="M1.157 10.655v5.73h5.73V10.655z" />
                      <path fill="#ef4022" d="M7.052 10.655v5.73h5.73V10.655z" />
                      <path fill="#84bc00" d="M1.157 4.76v5.73h5.73V4.76z" />
                      <path fill="#fdbd00" d="M7.052 4.76v5.73h5.73V4.76z" />
                    </svg>
                    <span className="text-sm font-medium">Conectar Outlook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Seguridad */}
        {activeTab === "security" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Cambiar contrasena</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-medium text-gray-600">Contrasena actual</label>
                  <input
                    className="border rounded p-2 w-full text-sm"
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    placeholder="Ingresa tu contrasena actual"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Nueva contrasena</label>
                  <input
                    className="border rounded p-2 w-full text-sm"
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                    placeholder="Minimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Confirmar nueva contrasena</label>
                  <input
                    className="border rounded p-2 w-full text-sm"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repite la nueva contrasena"
                  />
                </div>
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
                  onClick={handleChangePassword}
                >
                  Cambiar contrasena
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Informacion de acceso</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ultimo acceso</p>
                    <p className="text-sm text-gray-800">{formatDate(profile.last_login_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiUser className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Usuario</p>
                    <p className="text-sm text-gray-800 font-mono">@{profile.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mis Permisos - Oculto temporalmente */}
        {activeTab === "permissions" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Estos son los permisos que tienes asignados a traves de tus roles.
            </div>

            {PERMISSION_GROUPS.map((group) => {
              const groupPerms = group.keys.filter((key) => permMap[key]);
              if (groupPerms.length === 0) return null;

              return (
                <div key={group.label} className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>{group.icon}</span>
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupPerms.map((key) => (
                      <div key={key} className="flex items-center gap-2 text-sm py-1 px-2 bg-green-50 rounded">
                        <FiCheck className="text-green-600 flex-shrink-0" size={14} />
                        <span className="text-xs text-gray-500 font-mono">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((n) => ({ ...n, show: false }))}
        />
      )}

      {showConnectModal && (
        <ConnectEmailModal
          provider={showConnectModal}
          onClose={() => setShowConnectModal(null)}
          onConnected={handleEmailConnected}
        />
      )}
    </div>
  );
}

export default Profile;
