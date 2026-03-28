import React, { useState } from "react";
import { FiPlus, FiShield, FiTrash2, FiEdit2 } from "react-icons/fi";
import { createAdminRole, deleteAdminRole, updateAdminRolePermissions } from "../../api/admin";

export const RoleManagement = ({ roles = [], permissions = [], onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [formData, setFormData] = useState({ role_name: "", role_description: "", permission_ids: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const togglePermOnForm = (id) => {
    setFormData((p) => ({
      ...p,
      permission_ids: p.permission_ids.includes(id)
        ? p.permission_ids.filter((x) => x !== id)
        : [...p.permission_ids, id],
    }));
  };

  const togglePermOnRole = (id) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await createAdminRole(formData);
      setMessage("Rol creado correctamente");
      setFormData({ role_name: "", role_description: "", permission_ids: [] });
      setShowCreateForm(false);
      await onRefresh();
    } catch (err) {
      setError(err.message || "No se pudo crear el rol");
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedPermissionIds(role.permission_ids || []);
    setShowCreateForm(false);
  };

  const handleSavePermissions = async () => {
    setError("");
    setMessage("");
    try {
      await updateAdminRolePermissions(selectedRole.role_id, selectedPermissionIds);
      setMessage("Permisos actualizados correctamente");
      await onRefresh();
    } catch (err) {
      setError(err.message || "No se pudieron actualizar los permisos");
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.role_name === "admin") {
      setError("El rol admin no se puede eliminar");
      return;
    }
    if (!window.confirm(`Desea eliminar el rol "${role.role_name}"?`)) return;
    setError("");
    setMessage("");
    try {
      await deleteAdminRole(role.role_id);
      setMessage("Rol eliminado correctamente");
      if (selectedRole?.role_id === role.role_id) setSelectedRole(null);
      await onRefresh();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el rol");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}

      <div className="flex justify-end">
        {!showCreateForm && (
          <button
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            onClick={() => {
              setShowCreateForm(true);
              setSelectedRole(null);
              setFormData({ role_name: "", role_description: "", permission_ids: [] });
            }}
          >
            <FiPlus className="mr-1" /> Nuevo Rol
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Crear rol</h3>
          <form onSubmit={handleCreateRole}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input
                className="border rounded p-2"
                placeholder="Nombre del rol"
                value={formData.role_name}
                onChange={(e) => setFormData((p) => ({ ...p, role_name: e.target.value }))}
                required
              />
              <input
                className="border rounded p-2"
                placeholder="Descripcion"
                value={formData.role_description}
                onChange={(e) => setFormData((p) => ({ ...p, role_description: e.target.value }))}
              />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2">Permisos del rol</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              {permissions.map((perm) => (
                <label key={perm.permission_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.permission_ids.includes(perm.permission_id)}
                    onChange={() => togglePermOnForm(perm.permission_id)}
                  />
                  {perm.permission_description || perm.permission_key}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 border rounded text-gray-700" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Crear rol
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const permCount = role.permission_ids?.length || 0;
          const isSelected = selectedRole?.role_id === role.role_id;
          return (
            <div
              key={role.role_id}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer border-2 transition-colors ${
                isSelected ? "border-blue-500" : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => handleSelectRole(role)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiShield className={isSelected ? "text-blue-500" : "text-gray-400"} />
                  <span className="font-semibold">{role.role_name}</span>
                </div>
                {role.role_name !== "admin" && (
                  <button
                    className="p-1 rounded hover:bg-red-100 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(role);
                    }}
                    title="Eliminar rol"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              {role.role_description && (
                <p className="text-sm text-gray-500 mb-2">{role.role_description}</p>
              )}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {permCount} permiso{permCount !== 1 ? "s" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {selectedRole && !showCreateForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">
            Editar permisos: {selectedRole.role_name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            {permissions.map((perm) => (
              <label key={perm.permission_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPermissionIds.includes(perm.permission_id)}
                  onChange={() => togglePermOnRole(perm.permission_id)}
                />
                {perm.permission_description || perm.permission_key}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 border rounded text-gray-700" onClick={() => setSelectedRole(null)}>
              Cerrar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSavePermissions}>
              Guardar permisos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
