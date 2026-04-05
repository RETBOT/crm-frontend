import React, { useEffect, useMemo, useState } from "react";
import { FiUsers, FiShield, FiLock } from "react-icons/fi";
import {
  getAdminBranches,
  getAdminPermissions,
  getAdminRoles,
  getAdminRoutes,
  getAdminUsers,
} from "../../api/admin";
import { hasPermission } from "../../utils/auth";
import { UserManagement } from "../../components/admin/user-management";
import { RoleManagement } from "../../components/admin/role-management";
import { PermissionReference } from "../../components/admin/permission-reference";

const TABS = [
  { id: "users", label: "Usuarios", icon: <FiUsers />, permission: "users.manage" },
  { id: "roles", label: "Roles", icon: <FiShield />, permission: "roles.manage" },
  { id: "permissions", label: "Permisos", icon: <FiLock />, permission: "roles.manage" },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const canManageUsers = hasPermission("users.manage");
  const canManageRoles = hasPermission("roles.manage");
  const canManageScope = hasPermission("scope.manage");

  const visibleTabs = TABS.filter((tab) => hasPermission(tab.permission));

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData, permData, branchesData, routesData] = await Promise.all([
        canManageUsers || canManageRoles || canManageScope ? getAdminUsers() : Promise.resolve([]),
        canManageRoles ? getAdminRoles() : Promise.resolve([]),
        canManageUsers || canManageRoles || canManageScope ? getAdminPermissions() : Promise.resolve([]),
        canManageUsers || canManageRoles || canManageScope ? getAdminBranches() : Promise.resolve([]),
        canManageUsers || canManageRoles || canManageScope ? getAdminRoutes() : Promise.resolve([]),
      ]);
      const freshUsers = Array.isArray(usersData) ? usersData : [];
      setUsers(freshUsers);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permData) ? permData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);

      if (selectedUser) {
        const updated = freshUsers.find((u) => u.user_id === selectedUser.user_id);
        if (updated) {
          setSelectedUser({
            ...updated,
            role_names: (updated.roles || []).map((r) => r.role_name),
            role_ids: (updated.roles || []).map((r) => r.role_id),
          });
        }
      }
    } catch (err) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const usersWithRoles = useMemo(() => {
    return users.map((u) => ({
      ...u,
      role_names: (u.roles || []).map((r) => r.role_name),
      role_ids: (u.roles || []).map((r) => r.role_id),
    }));
  }, [users]);

  if (!canManageUsers && !canManageRoles && !canManageScope) {
    return (
      <div className="p-6 text-center text-gray-500">
        No cuenta con permisos para acceder a la administracion
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Administracion</h1>
        <p className="text-gray-600 mb-6">Gestion de usuarios, roles y permisos</p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-1 mb-6 border-b">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <UserManagement
            users={usersWithRoles}
            roles={roles}
            branches={branches}
            routes={routes}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onRefresh={loadData}
          />
        )}

        {activeTab === "roles" && (
          <RoleManagement
            roles={roles}
            permissions={permissions}
            onRefresh={loadData}
          />
        )}

        {activeTab === "permissions" && (
          <PermissionReference permissions={permissions} />
        )}
      </div>
    </div>
  );
}

export default Admin;
