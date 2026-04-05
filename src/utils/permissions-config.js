export const PERMISSION_GROUPS = [
  {
    label: "Usuarios y Acceso",
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
  {
    label: "Oportunidades",
    icon: "💼",
    keys: ["opportunities.create", "opportunities.update", "opportunities.delete", "opportunities.price.edit", "opportunities.items.create", "opportunities.items.update", "opportunities.items.delete"],
  },
  {
    label: "Productos",
    icon: "🏷️",
    keys: ["products.create", "products.update", "products.delete", "products.price.edit"],
  },
  {
    label: "Reportes",
    icon: "📊",
    keys: ["reports.view", "reports.export", "reports.scheduled", "reports.saved_views"],
  },
];
