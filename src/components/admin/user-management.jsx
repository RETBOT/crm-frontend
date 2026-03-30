import React, { useState } from "react";
import { FiPlus, FiSearch, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { createAdminUser } from "../../api/admin";
import { UserDetailPanel } from "./user-detail-panel";

export const UserManagement = ({ users = [], roles = [], branches = [], routes = [], selectedUser, onSelectUser, onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
    default_branch_id: "",
    is_multi_branch: false,
    is_active: true,
    role_ids: [],
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(s) ||
      (u.display_name || "").toLowerCase().includes(s)
    );
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await createAdminUser(formData);
      setMessage("Usuario creado correctamente");
      setFormData({
        username: "",
        display_name: "",
        email: "",
        password: "",
        default_branch_id: "",
        is_multi_branch: false,
        is_active: true,
        role_ids: [],
      });
      setShowCreateForm(false);
      await onRefresh();
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario");
    }
  };

  const toggleRoleOnForm = (id) => {
    setFormData((p) => ({
      ...p,
      role_ids: p.role_ids.includes(id) ? p.role_ids.filter((x) => x !== id) : [...p.role_ids, id],
    }));
  };

  return (
    <div className="flex gap-4 h-full">
      <div className={selectedUser ? "w-2/3" : "w-full"}>
        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
                placeholder="Buscar por nombre o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setError("");
                setMessage("");
              }}
            >
              <FiPlus className="mr-1" /> Nuevo Usuario
            </button>
          </div>

          {showCreateForm && (
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-md font-semibold mb-3">Crear usuario</h3>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="border rounded p-2"
                  placeholder="Nombre de usuario"
                  value={formData.username}
                  onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                  required
                />
                <input
                  className="border rounded p-2"
                  placeholder="Nombre completo"
                  value={formData.display_name}
                  onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))}
                  required
                />
                <input
                  className="border rounded p-2"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
                <input
                  className="border rounded p-2"
                  type="password"
                  placeholder="Contrasena"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  required
                />
                <select
                  className="border rounded p-2"
                  value={formData.default_branch_id}
                  onChange={(e) => setFormData((p) => ({ ...p, default_branch_id: e.target.value }))}
                >
                  <option value="">Sucursal por defecto</option>
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                  Usuario activo
                </label>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Roles iniciales</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {roles.map((role) => (
                      <label key={role.role_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.role_ids.includes(role.role_id)}
                          onChange={() => toggleRoleOnForm(role.role_id)}
                        />
                        {role.role_name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 border rounded text-gray-700" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Crear usuario
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Usuario</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Roles</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.user_id}
                    className={`border-t cursor-pointer transition-colors ${
                      selectedUser?.user_id === u.user_id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectUser(u)}
                  >
                    <td className="p-3 font-mono text-xs">@{u.username}</td>
                    <td className="p-3 font-medium">{u.display_name}</td>
                    <td className="p-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                          <FiCheckCircle /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                          <FiXCircle /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.role_names || []).map((name, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="w-1/3">
          <UserDetailPanel
            user={selectedUser}
            roles={roles}
            branches={branches}
            routeOptions={routes}
            onRefresh={onRefresh}
            onClose={() => onSelectUser(null)}
          />
        </div>
      )}
    </div>
  );
};
