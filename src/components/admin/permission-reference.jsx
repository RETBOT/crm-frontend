import React from "react";

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
  "activities.assign": "Actividades > Asignar a otros",
};

const PERMISSION_GROUPS = [
  {
    label: "Usuarios",
    icon: "👤",
    keys: ["users.manage", "roles.manage", "scope.manage"],
  },
  {
    label: "Clientes",
    icon: "📦",
    keys: ["customers.create", "customers.update", "customers.delete"],
  },
  {
    label: "Prospectos",
    icon: "🔄",
    keys: ["prospects.create", "prospects.update", "prospects.delete", "prospects.convert"],
  },
  {
    label: "Actividades",
    icon: "📅",
    keys: ["activities.create", "activities.update", "activities.complete", "activities.assign"],
  },
];

export const PermissionReference = ({ permissions = [] }) => {
  const permMap = {};
  permissions.forEach((p) => {
    permMap[p.permission_key] = p;
  });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Los permisos se crean desde scripts del desarrollador. Aqui puedes ver los disponibles y asignarlos a roles.
      </div>

      {PERMISSION_GROUPS.map((group) => {
        const groupPerms = group.keys
          .map((key) => permMap[key])
          .filter(Boolean);

        if (groupPerms.length === 0) return null;

        return (
          <div key={group.label} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>{group.icon}</span>
              {group.label}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Clave</th>
                    <th className="text-left p-2">Descripcion</th>
                    <th className="text-left p-2">Ubicacion</th>
                  </tr>
                </thead>
                <tbody>
                  {groupPerms.map((perm) => (
                    <tr key={perm.permission_id} className="border-t">
                      <td className="p-2 font-mono text-xs">{perm.permission_key}</td>
                      <td className="p-2">{perm.permission_description}</td>
                      <td className="p-2 text-xs text-gray-500">
                        {PERMISSION_CONTEXT[perm.permission_key] || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
