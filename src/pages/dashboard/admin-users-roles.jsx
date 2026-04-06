import React, { useEffect, useMemo, useState } from "react";
import {
  createAdminRole,
  createAdminUser,
  deleteAdminRole,
  getAdminBranches,
  getAdminPermissions,
  getAdminRoles,
  getAdminRoutes,
  getAdminUserScope,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminRolePermissions,
  updateAdminUserRoles,
  updateAdminUserScope,
} from "../../api/admin";
import { hasPermission } from "../../utils/auth";

const PERMISSION_CONTEXT = {
  "users.manage": "Admin > Crear usuario",
  "roles.manage": "Admin > Roles y permisos",
  "scope.manage": "Admin > Alcance de datos",
  "customers.create": "Clientes > Nuevo cliente",
  "customers.update": "Clientes > Editar",
  "customers.delete": "Clientes > Inactivar",
  "prospects.create": "Prospectos > Nuevo prospecto",
  "prospects.update": "Prospectos > Editar",
  "prospects.delete": "Prospectos > Inactivar",
  "prospects.convert": "Prospectos > Convertir a cliente",
  "activities.create": "Actividades > Nueva actividad",
  "activities.update": "Actividades > Editar",
  "activities.complete": "Actividades > Completar/Cancelar",
};

export function AdminUsersRoles() {
  const canManageUsers = hasPermission("users.manage");
  const canManageRoles = hasPermission("roles.manage");
  const canManageScope = hasPermission("scope.manage");

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [scopeConfig, setScopeConfig] = useState({ scope_type: "BRANCH", branch_ids: [], route_ids: [] });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [selectedRoleId, setSelectedRoleId] = useState(0);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

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

  const [roleFormData, setRoleFormData] = useState({
    role_name: "",
    role_description: "",
    permission_ids: [],
  });
  const [resetPassword, setResetPassword] = useState("");

  const selectedUser = useMemo(
    () => users.find((u) => Number(u.user_id) === Number(selectedUserId)) || null,
    [users, selectedUserId]
  );

  const selectedRole = useMemo(
    () => roles.find((r) => Number(r.role_id) === Number(selectedRoleId)) || null,
    [roles, selectedRoleId]
  );

  const visibleRoutesByScopeBranch = useMemo(() => {
    if (scopeConfig.branch_ids.length === 0) return [];
    return routes.filter((route) => scopeConfig.branch_ids.includes(route.branch_id));
  }, [routes, scopeConfig.branch_ids]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const usersData = canManageUsers || canManageRoles || canManageScope ? await getAdminUsers() : [];
      const rolesData = canManageRoles ? await getAdminRoles() : [];
      const permissionsData = canManageRoles || canManageUsers ? await getAdminPermissions() : [];
      const branchesData = canManageScope ? await getAdminBranches() : [];
      const routesData = canManageScope ? await getAdminRoutes() : [];

      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
    } catch (err) {
      setError(err.message || "No se pudo cargar información de administración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManageUsers && !canManageRoles && !canManageScope) return;
    loadData();
  }, [canManageUsers, canManageRoles, canManageScope]);

  useEffect(() => {
    if (!selectedUser || !canManageScope) {
      setScopeConfig({ scope_type: "BRANCH", branch_ids: [], route_ids: [] });
      return;
    }

    getAdminUserScope(selectedUser.user_id)
      .then((scope) => {
        setScopeConfig({
          scope_type: scope.scope_type || "BRANCH",
          branch_ids: Array.isArray(scope.branch_ids) ? scope.branch_ids : [],
          route_ids: Array.isArray(scope.route_ids) ? scope.route_ids : [],
        });
      })
      .catch((err) => {
        setError(err.message || "No se pudo cargar el alcance del usuario");
      });
  }, [selectedUserId, canManageScope]);

  useEffect(() => {
    if (scopeConfig.scope_type !== "ROUTE") {
      setScopeConfig((prev) => ({ ...prev, route_ids: [] }));
      return;
    }

    setScopeConfig((prev) => ({
      ...prev,
      route_ids: prev.route_ids.filter((routeId) => {
        const route = routes.find((r) => r.route_id === routeId);
        return !!route && prev.branch_ids.includes(route.branch_id);
      }),
    }));
  }, [scopeConfig.scope_type, scopeConfig.branch_ids, routes]);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedRoleIds([]);
      return;
    }
    setSelectedRoleIds(selectedUser.roles.map((role) => role.role_id));
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!selectedRole) {
      setSelectedPermissionIds([]);
      return;
    }

    const permissionIds = permissions
      .filter((permission) => selectedRole.permissions.includes(permission.permission_key))
      .map((permission) => permission.permission_id);

    setSelectedPermissionIds(permissionIds);
  }, [selectedRoleId, roles, permissions]);

  const toggleRoleOnForm = (roleId) => {
    setFormData((prev) => {
      const exists = prev.role_ids.includes(roleId);
      return {
        ...prev,
        role_ids: exists ? prev.role_ids.filter((id) => id !== roleId) : [...prev.role_ids, roleId],
      };
    });
  };

  const toggleRoleOnSelectedUser = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const togglePermissionOnRoleForm = (permissionId) => {
    setRoleFormData((prev) => {
      const exists = prev.permission_ids.includes(permissionId);
      return {
        ...prev,
        permission_ids: exists
          ? prev.permission_ids.filter((id) => id !== permissionId)
          : [...prev.permission_ids, permissionId],
      };
    });
  };

  const togglePermissionOnSelectedRole = (permissionId) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    );
  };

  const toggleScopeBranch = (branchId) => {
    setScopeConfig((prev) => {
      const exists = prev.branch_ids.includes(branchId);
      return {
        ...prev,
        branch_ids: exists ? prev.branch_ids.filter((id) => id !== branchId) : [...prev.branch_ids, branchId],
      };
    });
  };

  const toggleScopeRoute = (routeId) => {
    setScopeConfig((prev) => {
      const exists = prev.route_ids.includes(routeId);
      return {
        ...prev,
        route_ids: exists ? prev.route_ids.filter((id) => id !== routeId) : [...prev.route_ids, routeId],
      };
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!canManageUsers) {
      setError("No cuenta con permisos para crear usuarios");
      return;
    }

    try {
      await createAdminUser({
        ...formData,
        default_branch_id: formData.default_branch_id ? Number(formData.default_branch_id) : null,
      });
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
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario");
    }
  };

  const handleSaveUserRoles = async () => {
    setMessage("");
    setError("");

    if (!selectedUser) {
      setError("Selecciona un usuario");
      return;
    }

    if (!canManageRoles) {
      setError("No cuenta con permisos para administrar roles");
      return;
    }

    try {
      await updateAdminUserRoles(selectedUser.user_id, selectedRoleIds);
      setMessage("Roles actualizados correctamente");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudieron actualizar los roles");
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!canManageRoles) {
      setError("No cuenta con permisos para crear roles");
      return;
    }

    try {
      await createAdminRole(roleFormData);
      setMessage("Rol creado correctamente");
      setRoleFormData({ role_name: "", role_description: "", permission_ids: [] });
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo crear el rol");
    }
  };

  const handleSaveRolePermissions = async () => {
    setMessage("");
    setError("");

    if (!selectedRole) {
      setError("Selecciona un rol");
      return;
    }

    if (!canManageRoles) {
      setError("No cuenta con permisos para administrar roles");
      return;
    }

    try {
      await updateAdminRolePermissions(selectedRole.role_id, selectedPermissionIds);
      setMessage("Permisos del rol actualizados correctamente");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudieron actualizar los permisos del rol");
    }
  };

  const handleDeleteRole = async (role) => {
    setMessage("");
    setError("");

    if (!canManageRoles) {
      setError("No cuenta con permisos para eliminar roles");
      return;
    }

    if (!window.confirm(`¿Desea eliminar el rol ${role.role_name}?`)) return;

    try {
      await deleteAdminRole(role.role_id);
      setMessage("Rol eliminado correctamente");
      if (Number(selectedRoleId) === Number(role.role_id)) {
        setSelectedRoleId(0);
        setSelectedPermissionIds([]);
      }
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el rol");
    }
  };

  const handleResetPassword = async () => {
    setMessage("");
    setError("");

    if (!selectedUser) {
      setError("Selecciona un usuario");
      return;
    }

    if (!canManageUsers) {
      setError("No cuenta con permisos para resetear contrasenas");
      return;
    }

    if (!resetPassword || resetPassword.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    if (!window.confirm(`Desea cambiar la contrasena de ${selectedUser.username}?`)) return;

    try {
      await resetAdminUserPassword(selectedUser.user_id, resetPassword);
      setMessage(`Contrasena de ${selectedUser.username} actualizada correctamente`);
      setResetPassword("");
    } catch (err) {
      setError(err.message || "No se pudo resetear la contrasena");
    }
  };

  const handleSaveUserScope = async () => {
    setMessage("");
    setError("");

    if (!selectedUser) {
      setError("Selecciona un usuario");
      return;
    }

    if (!canManageScope) {
      setError("No cuenta con permisos para administrar alcance de datos");
      return;
    }

    try {
      await updateAdminUserScope(selectedUser.user_id, scopeConfig);
      setMessage("Alcance de datos actualizado correctamente");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el alcance");
    }
  };

  if (!canManageUsers && !canManageRoles && !canManageScope) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Administración de roles y usuarios</h1>
        <p className="text-gray-600">No tienes permisos para acceder a este módulo.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Administración de roles y usuarios</h1>

      {message && <div className="p-3 rounded bg-green-100 text-green-800">{message}</div>}
      {error && <div className="p-3 rounded bg-red-100 text-red-800">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">Cargando...</div>
      ) : (
        <>
          {canManageUsers && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Crear usuario</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleCreateUser}>
                <input className="border rounded p-2" placeholder="Username" value={formData.username} onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))} required />
                <input className="border rounded p-2" placeholder="Nombre para mostrar" value={formData.display_name} onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))} required />
                <input className="border rounded p-2" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                <input className="border rounded p-2" type="password" placeholder="Contraseña" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required />
                <input className="border rounded p-2" type="number" placeholder="ID sucursal por defecto (opcional)" value={formData.default_branch_id} onChange={(e) => setFormData((p) => ({ ...p, default_branch_id: e.target.value }))} />
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_multi_branch} onChange={(e) => setFormData((p) => ({ ...p, is_multi_branch: e.target.checked }))} />Multi sucursal</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))} />Activo</label>
                </div>

                {canManageRoles && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Roles iniciales</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <label key={role.role_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={formData.role_ids.includes(role.role_id)} onChange={() => toggleRoleOnForm(role.role_id)} />
                          {role.role_name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Crear usuario</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Usuarios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Usuario</th>
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Roles</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id} className={`border-t cursor-pointer hover:bg-blue-50 ${Number(selectedUserId) === Number(user.user_id) ? "bg-blue-50" : ""}`} onClick={() => setSelectedUserId(user.user_id)}>
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.display_name}</td>
                      <td className="p-2">{user.roles.map((r) => r.role_name).join(", ") || "Sin roles"}</td>
                      <td className="p-2">{user.is_active ? "ACTIVO" : "INACTIVO"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {canManageRoles && selectedUser && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Roles de {selectedUser.username}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                {roles.map((role) => (
                  <label key={role.role_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedRoleIds.includes(role.role_id)} onChange={() => toggleRoleOnSelectedUser(role.role_id)} />
                    {role.role_name}
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveUserRoles}>Guardar roles</button>
              </div>
            </div>
          )}

          {canManageUsers && selectedUser && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Resetear contrasena de {selectedUser.username}</h2>
              <div className="flex items-center gap-3">
                <input
                  className="border rounded p-2 flex-1 max-w-sm"
                  type="password"
                  placeholder="Nueva contrasena (minimo 6 caracteres)"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  minLength={6}
                />
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={handleResetPassword}
                  disabled={!resetPassword || resetPassword.length < 6}
                >
                  Resetear contrasena
                </button>
              </div>
            </div>
          )}

          {canManageScope && selectedUser && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Alcance de datos de {selectedUser.username}</h2>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Tipo de alcance</label>
                <select
                  className="w-full md:w-64 border rounded p-2 mt-1"
                  value={scopeConfig.scope_type}
                  onChange={(e) => setScopeConfig((prev) => ({ ...prev, scope_type: e.target.value }))}
                >
                  <option value="ALL">ALL (todas sucursales y vendedores)</option>
                  <option value="BRANCH">BRANCH (solo sucursales asignadas)</option>
                  <option value="ROUTE">ROUTE (sucursales asignadas + vendedores permitidos)</option>
                </select>
              </div>

              {scopeConfig.scope_type !== "ALL" && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Sucursales permitidas</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {branches.map((branch) => (
                      <label key={branch.branch_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={scopeConfig.branch_ids.includes(branch.branch_id)}
                          onChange={() => toggleScopeBranch(branch.branch_id)}
                        />
                        {branch.branch_name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {scopeConfig.scope_type === "ROUTE" && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vendedores permitidos (solo de sucursales asignadas)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {visibleRoutesByScopeBranch.map((route) => (
                      <label key={route.route_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={scopeConfig.route_ids.includes(route.route_id)}
                          onChange={() => toggleScopeRoute(route.route_id)}
                        />
                        {route.route_name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveUserScope}>
                  Guardar alcance
                </button>
              </div>
            </div>
          )}

          {canManageRoles && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Permisos disponibles ({permissions.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2">Clave</th>
                      <th className="text-left p-2">Descripcion</th>
                      <th className="text-left p-2">Ubicacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.permission_id} className="border-t">
                        <td className="p-2 font-mono text-xs">{perm.permission_key}</td>
                        <td className="p-2">{perm.permission_description}</td>
                        <td className="p-2 text-xs text-gray-500">{PERMISSION_CONTEXT[perm.permission_key] || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {canManageRoles && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Crear rol</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleCreateRole}>
                <input className="border rounded p-2" placeholder="Nombre del rol" value={roleFormData.role_name} onChange={(e) => setRoleFormData((p) => ({ ...p, role_name: e.target.value }))} required />
                <input className="border rounded p-2" placeholder="Descripción del rol" value={roleFormData.role_description} onChange={(e) => setRoleFormData((p) => ({ ...p, role_description: e.target.value }))} />

                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Permisos del rol</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {permissions.map((permission) => (
                      <label key={permission.permission_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={roleFormData.permission_ids.includes(permission.permission_id)} onChange={() => togglePermissionOnRoleForm(permission.permission_id)} />
                        {permission.permission_description || permission.permission_key}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Crear rol</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Roles disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {roles.map((role) => (
                <div key={role.role_id} onClick={() => setSelectedRoleId(role.role_id)} className={`border rounded p-3 text-left cursor-pointer ${Number(selectedRoleId) === Number(role.role_id) ? "border-blue-500 bg-blue-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{role.role_name}</p>
                    {canManageRoles && role.role_name.toLowerCase() !== "admin" && (
                      <button
                        type="button"
                        className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role);
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{role.role_description || "Sin descripción"}</p>
                  <div className="mt-2 text-xs text-gray-600">{role.permissions.join(", ") || "Sin permisos"}</div>
                </div>
              ))}
            </div>

            {canManageRoles && selectedRole && (
              <div className="border rounded p-3">
                <h3 className="font-semibold mb-2">Editar permisos: {selectedRole.role_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  {permissions.map((permission) => (
                    <label key={permission.permission_id} className="border rounded p-2 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedPermissionIds.includes(permission.permission_id)} onChange={() => togglePermissionOnSelectedRole(permission.permission_id)} />
                      {permission.permission_description || permission.permission_key}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveRolePermissions}>
                    Guardar permisos del rol
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminUsersRoles;
