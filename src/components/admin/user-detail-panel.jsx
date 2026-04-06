import React, { useEffect, useState } from "react";
import { FiKey, FiShield, FiMap, FiEdit2 } from "react-icons/fi";
import { updateAdminUserRoles, updateAdminUserScope, resetAdminUserPassword, getAdminUserScope, updateAdminUser, sendAdminPasswordResetEmail } from "../../api/admin";

export const UserDetailPanel = ({ user, roles = [], branches = [], routeOptions = [], onRefresh, onClose }) => {
  const [activeSection, setActiveSection] = useState("roles");
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [scopeConfig, setScopeConfig] = useState({ scope_type: "ALL", branch_ids: [], route_ids: [] });
  const [newPassword, setNewPassword] = useState("");
  const [editForm, setEditForm] = useState({ display_name: "", email: "", default_branch_id: "", is_active: true });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.role_ids || []);
      setEditForm({
        display_name: user.display_name || "",
        email: user.email || "",
        default_branch_id: user.default_branch_id || "",
        is_active: user.is_active !== false,
      });
      setError("");
      setMessage("");
      setActiveSection("roles");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadScope();
    }
  }, [user]);

  const loadScope = async () => {
    try {
      const data = await getAdminUserScope(user.user_id);
      setScopeConfig({
        scope_type: data.scope_type || "ALL",
        branch_ids: data.branch_ids || [],
        route_ids: data.route_ids || [],
      });
    } catch {
      setScopeConfig({ scope_type: "ALL", branch_ids: [], route_ids: [] });
    }
  };

  const toggleRole = (id) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleBranch = (id) => {
    setScopeConfig((prev) => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(id)
        ? prev.branch_ids.filter((x) => x !== id)
        : [...prev.branch_ids, id],
    }));
  };

  const toggleRoute = (id) => {
    setScopeConfig((prev) => ({
      ...prev,
      route_ids: prev.route_ids.includes(id)
        ? prev.route_ids.filter((x) => x !== id)
        : [...prev.route_ids, id],
    }));
  };

  const handleSaveRoles = async () => {
    setError("");
    setMessage("");
    try {
      await updateAdminUserRoles(user.user_id, selectedRoleIds);
      setMessage("Roles actualizados correctamente");
      await onRefresh();
    } catch (err) {
      setError(err.message || "Error al guardar roles");
    }
  };

  const handleSaveScope = async () => {
    setError("");
    setMessage("");
    try {
      await updateAdminUserScope(user.user_id, scopeConfig);
      setMessage("Alcance actualizado correctamente");
      await onRefresh();
    } catch (err) {
      setError(err.message || "Error al guardar alcance");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }
    if (!window.confirm(`Desea cambiar la contrasena de ${user.username}?`)) return;
    setError("");
    setMessage("");
    try {
      await resetAdminUserPassword(user.user_id, newPassword);
      setMessage("Contrasena actualizada correctamente");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Error al resetear contrasena");
    }
  };

  const handleSendResetEmail = async () => {
    if (!user.email) {
      setError("El usuario no tiene un correo registrado");
      return;
    }
    if (!window.confirm(`Se enviara un enlace de recuperacion a ${user.email}. Desea continuar?`)) return;
    setError("");
    setMessage("");
    try {
      const result = await sendAdminPasswordResetEmail(user.user_id);
      setMessage(result.message || "Enlace enviado correctamente");
    } catch (err) {
      setError(err.message || "Error al enviar enlace de recuperacion");
    }
  };

  const handleSaveEdit = async () => {
    setError("");
    setMessage("");
    if (!editForm.display_name || editForm.display_name.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (editForm.is_active === false && !window.confirm(`Desea desactivar a ${user.username}?`)) return;
    try {
      const payload = {
        display_name: editForm.display_name,
        email: editForm.email,
        default_branch_id: editForm.default_branch_id ? Number(editForm.default_branch_id) : null,
        is_active: editForm.is_active,
      };
      await updateAdminUser(user.user_id, payload);
      setMessage("Usuario actualizado correctamente");
      await onRefresh();
    } catch (err) {
      setError(err.message || "Error al actualizar usuario");
    }
  };

  if (!user) return null;

  const tabs = [
    { id: "edit", label: "Editar", icon: <FiEdit2 /> },
    { id: "roles", label: "Roles", icon: <FiShield /> },
    { id: "password", label: "Contrasena", icon: <FiKey /> },
    { id: "scope", label: "Alcance", icon: <FiMap /> },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{user.display_name}</h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 text-sm" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-1 px-2 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSection(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">{message}</div>
        )}

        {activeSection === "edit" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">Editar informacion del usuario</p>
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
            <div>
              <label className="text-xs font-medium text-gray-600">Sucursal por defecto</label>
              <select
                className="border rounded p-2 w-full text-sm"
                value={editForm.default_branch_id}
                onChange={(e) => setEditForm((p) => ({ ...p, default_branch_id: e.target.value }))}
              >
                <option value="">Sin sucursal</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              Usuario activo
            </label>
            <div className="flex justify-end pt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" onClick={handleSaveEdit}>
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {activeSection === "roles" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Selecciona los roles para este usuario</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              {roles.map((role) => (
                <label key={role.role_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.role_id)}
                    onChange={() => toggleRole(role.role_id)}
                  />
                  <FiShield className="text-gray-400" size={12} />
                  {role.role_name}
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" onClick={handleSaveRoles}>
                Guardar roles
              </button>
            </div>
          </div>
        )}

        {activeSection === "password" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">Ingresa la nueva contrasena para {user.username}</p>
              <div className="flex flex-wrap items-center gap-3 max-w-md">
                <input
                  type="password"
                  className="border rounded p-2 flex-1"
                  placeholder="Nueva contrasena (minimo 6 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  onClick={handleResetPassword}
                  disabled={!newPassword || newPassword.length < 6}
                >
                  Resetear
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">O envia un enlace de recuperacion al correo</p>
              <p className="text-xs text-gray-400 mb-3">
                Correo registrado: {user.email || <span className="text-red-400">No registrado</span>}
              </p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendResetEmail}
                disabled={!user.email}
              >
                Enviar enlace al correo
              </button>
            </div>
          </div>
        )}

        {activeSection === "scope" && (
          <div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Tipo de alcance</label>
              <select
                className="border rounded p-2 mt-1 w-full max-w-xs"
                value={scopeConfig.scope_type}
                onChange={(e) => setScopeConfig((p) => ({ ...p, scope_type: e.target.value }))}
              >
                <option value="ALL">Todas las sucursales y vendedores</option>
                <option value="BRANCH">Sucursales especificas</option>
                <option value="ROUTE">Vendedores especificos</option>
              </select>
            </div>

            {scopeConfig.scope_type === "BRANCH" && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Sucursales</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {branches.map((b) => (
                    <label key={b.branch_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={scopeConfig.branch_ids.includes(b.branch_id)}
                        onChange={() => toggleBranch(b.branch_id)}
                      />
                      {b.branch_name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {scopeConfig.scope_type === "ROUTE" && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Vendedores</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {routeOptions.map((r) => (
                    <label key={r.route_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={scopeConfig.route_ids.includes(r.route_id)}
                        onChange={() => toggleRoute(r.route_id)}
                      />
                      {r.route_name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" onClick={handleSaveScope}>
                Guardar alcance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
