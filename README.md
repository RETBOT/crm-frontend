# RETFlow CRM - Frontend

> **Estructura y control para tu operación comercial**

Frontend del sistema **RETFlow CRM**, construido con React, Vite y Material Tailwind.

- **RETEX** = Relationship Execution & Tracking Excellence
- **RETFlow** = Relationship Execution & Tracking Flow

---

## Requisitos

- Node.js 20+
- Backend RETFlow CRM corriendo (por defecto en `http://localhost:4000`)

## Configuración

1. Copiar `.env.example` a `.env` (si existe)
2. Configurar la URL del backend:

```
VITE_API_URL=http://localhost:4000/api/
VITE_RUTA_SERVER=http://localhost:5173
VITE_SECRET_KEY=
```

3. Ejecutar:

```bash
npm install
npm run dev
```

## Estructura del proyecto

```
src/
├── api/                        # Funciones axios para cada módulo
│   ├── accounts.js             # Clientes, prospectos, contactos, catálogos
│   ├── activities.js           # CRUD de actividades
│   ├── admin.js                # Usuarios, roles, permisos
│   ├── auth.js                 # Login, refresh token, recuperar/reset contraseña
│   ├── dashboard.js            # Panel de control, alertas vencidas
│   ├── opportunities.js        # Pipeline de oportunidades
│   ├── products.js             # Catálogo de productos
│   ├── reports.js              # Reportes y exportación
│   └── notifications.js        # Notificaciones del sistema
├── components/
│   ├── accounts/               # Formularios y listas de clientes/prospectos
│   │   ├── activityform.jsx    # Formulario de actividad por cliente
│   │   ├── activitylist.jsx    # Lista de actividades por cliente
│   │   ├── contactform.jsx     # Formulario de contacto
│   │   └── customerform.jsx    # Formulario de cliente/prospecto con mapa
│   ├── admin/                  # Componentes de administración
│   │   ├── permission-reference.jsx
│   │   ├── role-management.jsx
│   │   ├── user-detail-panel.jsx
│   │   └── user-management.jsx
│   ├── notifications/          # Componente de notificación
│   │   └── notification.jsx
│   ├── opportunities/          # Formulario de oportunidad
│   │   └── opportunityform.jsx
│   ├── products/               # Formulario de producto
│   │   └── productform.jsx
│   └── reports/                # Componentes reutilizables de reportes
│       ├── chart-container.jsx
│       ├── export-button.jsx
│       ├── kpi-card.jsx
│       └── report-filters.jsx
├── configs/                    # Configuración de gráficos (chartsConfig)
├── layouts/                    # Layouts principales
│   ├── dashboard.jsx           # Layout del dashboard con sidebar
│   └── auth.jsx                # Layout de autenticación
├── pages/
│   ├── auth/                   # Páginas de autenticación
│   │   ├── sign-in.jsx         # Login con logo RETEX
│   │   ├── sign-up.jsx         # Registro (boilerplate)
│   │   ├── forgot-password.jsx # Solicitar recuperación
│   │   └── reset-password.jsx  # Restablecer con token
│   └── dashboard/              # Páginas principales del sistema
│       ├── home.jsx            # Dashboard con KPIs, gráficos, alertas
│       ├── accounts.jsx        # Gestión de clientes
│       ├── prospects.jsx       # Gestión de prospectos
│       ├── activities.jsx      # Listado de actividades
│       ├── contacts.jsx        # Listado de contactos
│       ├── opportunities.jsx   # Pipeline de oportunidades
│       ├── products.jsx        # Catálogo de productos
│       ├── maps.jsx            # Mapa interactivo de clientes
│       ├── reports.jsx         # Centro de reportes
│       ├── notifications.jsx   # Notificaciones
│       ├── admin.jsx           # Panel de administración
│       ├── admin-users-roles.jsx   # Gestión de usuarios y roles
│       ├── profile.jsx         # Perfil de usuario
│       └── reports/            # Reportes detallados
│           ├── activities-report.jsx
│           ├── customers-report.jsx
│           ├── dashboard-report.jsx
│           ├── opportunities-report.jsx
│           ├── products-report.jsx
│           └── sales-report.jsx
├── routes/
│   ├── AppRoutes.jsx           # Rutas con protección de autenticación
│   └── routes.jsx              # Definición de rutas y menú lateral
├── widgets/                    # Componentes reutilizables del layout
│   ├── layout/
│   │   ├── sidenav.jsx         # Menú lateral con logo RETFlow
│   │   ├── navbar.jsx          # Barra superior
│   │   ├── footer.jsx          # Pie de página
│   │   └── configurator.jsx    # Panel de configuración visual
│   ├── cards/                  # Tarjetas de estadísticas
│   └── charts/                 # Gráficos estadísticos
└── utils/
    └── auth.js                 # Utilidades de autenticación y permisos
```

## Funcionalidades principales

### Autenticación
- Login con logo RETEX y diseño profesional
- Recuperación de contraseña por email (flujo completo con token)
- Refresh token automático
- Protección de rutas por autenticación y permisos

### Panel de Control (Dashboard)
- Tarjetas KPI: ventas del mes, meta, oportunidades ganadas, clientes nuevos
- Gráficos: tendencia de ventas, oportunidades por estatus, actividades por estatus
- Tabla de oportunidades activas
- Widget de alertas: actividades vencidas con contador y lista resumida
- **Loading skeletons** en todas las secciones para evitar layout shift

### Clientes
- Listado con búsqueda (debounce 400ms), filtros (estatus, sucursal, ruta) y paginación
- Crear, editar, inactivar clientes con validación de permisos
- Formulario con mapa integrado para geolocalización (Leaflet)
- Detalle con 5 tabs: Detalles, Análisis, Contactos, Oportunidades, Actividades
- **Análisis financiero**: venta neta, margen, línea de crédito, cartera vencida
- **Contactos**: CRUD completo con permisos, búsqueda por puesto
- **Actividades**: crear, completar, cancelar con formulario integrado

### Prospectos
- Mismas funcionalidades que clientes
- Conversión a cliente con un clic
- Permisos separados de clientes

### Mapa
- Mapa interactivo con markers de clientes (Leaflet + OpenStreetMap)
- **Clustering automático** de markers
- **Marcadores por estatus**: verde (activo), gris (inactivo)
- **Botón "Mi ubicación"**: centra el mapa en tu posición GPS con marcador azul
- **Búsqueda de dirección**: geocodificación con Nominatim
- **Persistencia de estado**: zoom, centro y filtros se guardan en la URL
- **Optimización de ruta**: selecciona clientes → OSRM calcula ruta por calles reales
  - Muestra polilínea en el mapa siguiendo calles
  - Marcadores numerados en cada parada
  - Panel con distancias y tiempos entre paradas
  - Fallback a línea recta si OSRM no está disponible
- Filtros: búsqueda, estatus, sucursal, ruta
- Click en cliente centra el mapa y abre popup
- Fallback a Google Maps para clientes sin coordenadas

### Actividades
- Listado con filtros por estatus (Pendiente, Programada, Vencidas, Completada, Cancelada)
- Búsqueda con debounce
- Crear actividad con selector de cliente y contacto
- Editar, completar, cancelar actividades
- **Highlight visual** de actividades vencidas (borde rojo, fecha roja, badge de días)
- Filtro "Vencidas" para mostrar solo actividades con fecha pasada

### Oportunidades
- Pipeline visual estilo kanban
- Crear, editar, eliminar oportunidades
- Gestión de items dentro de oportunidades
- Control de precios y probabilidades
- Filtros por estatus y etapa

### Productos
- Catálogo de productos con CRUD completo
- Control de precios
- Permisos separados para edición de precios

### Reportes
- Centro de reportes con múltiples tipos:
  - Reporte de actividades
  - Reporte de clientes
  - Reporte de oportunidades
  - Reporte de productos
  - Reporte de ventas
  - Reporte del dashboard
- Exportación a CSV/Excel
- Filtros por rango de fechas y otros criterios

### Administración
- Crear/eliminar usuarios
- Asignar roles a usuarios
- Crear/eliminar roles
- Asignar permisos a roles (con descripción y ubicación)
- Configurar alcance de datos (ALL/BRANCH/ROUTE) por usuario

## Sistema de permisos

Los permisos controlan acceso a funcionalidades. Solo el desarrollador crea permisos (via seed script SQL). El administrador los asigna a roles desde la UI.

### Administración
| Permiso | Controla |
|---------|----------|
| `users.manage` | Crear y gestionar usuarios |
| `roles.manage` | Crear/editar/eliminar roles y permisos |
| `scope.manage` | Configurar alcance de datos |

### Clientes
| Permiso | Controla |
|---------|----------|
| `customers.read` | Ver lista de clientes |
| `customers.create` | Botón "Nuevo cliente" |
| `customers.update` | Botón "Editar" y gestión de contactos |
| `customers.delete` | Botón "Inactivar" |

### Prospectos
| Permiso | Controla |
|---------|----------|
| `prospects.read` | Ver lista de prospectos |
| `prospects.create` | Botón "Nuevo prospecto" |
| `prospects.update` | Botón "Editar" en prospectos |
| `prospects.delete` | Botón "Inactivar" en prospectos |
| `prospects.convert` | Botón "Convertir a cliente" |

### Actividades
| Permiso | Controla |
|---------|----------|
| `activities.create` | Botón "Nueva Actividad" |
| `activities.update` | Botón "Editar" en actividades |
| `activities.complete` | Botones "Completar"/"Cancelar" |
| `activities.assign` | Asignar actividades a usuarios |

### Oportunidades
| Permiso | Controla |
|---------|----------|
| `opportunities.create` | Crear oportunidades |
| `opportunities.update` | Editar oportunidades |
| `opportunities.delete` | Eliminar oportunidades |
| `opportunities.price.edit` | Editar precios |
| `opportunities.items.*` | Gestionar items de oportunidades |

### Productos
| Permiso | Controla |
|---------|----------|
| `products.create` | Crear productos |
| `products.update` | Editar productos |
| `products.delete` | Eliminar productos |
| `products.price.edit` | Editar precios |

### Reportes
| Permiso | Controla |
|---------|----------|
| `reports.view` | Ver reportes |
| `reports.export` | Exportar reportes |
| `reports.scheduled` | Programar reportes |
| `reports.saved_views` | Guardar vistas |

## Rutas

### Autenticación
| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/auth/sign-in` | SignIn | Público |
| `/auth/forgot-password` | ForgotPassword | Público |
| `/auth/reset-password` | ResetPassword | Público (con token) |

### Dashboard
| Ruta | Componente | Permisos requeridos |
|------|-----------|---------------------|
| `/dashboard/home` | Home | Auth |
| `/dashboard/accounts` | Accounts | Auth |
| `/dashboard/prospects` | Prospects | Auth |
| `/dashboard/map` | Maps | Auth |
| `/dashboard/activities` | Activities | Auth |
| `/dashboard/contacts` | Contacts | Auth |
| `/dashboard/opportunities` | Opportunities | Auth |
| `/dashboard/products` | Products | Auth |
| `/dashboard/reports` | Reports | `reports.view` |
| `/dashboard/admin` | Admin | `users.manage`, `roles.manage`, `scope.manage` |

## Build

```bash
npm run build
```

El output se genera en `dist/`.

## Notas

- **RETEX** = estructura y control · **RETFlow** = ejecución y movimiento
- La autenticación usa JWT con refresh token automático
- El menú lateral filtra opciones según permisos del usuario
- Las actividades cambian a "Programada" automáticamente al asignar fecha
- Actividades vencidas se muestran con highlight rojo en todas las vistas
- El dashboard carga alertas de vencidas en paralelo con los KPIs
- Búsqueda con debounce de 400ms en clientes, prospectos y actividades
- Formularios con estado `saving` para prevenir doble submit
- Loading skeletons en el dashboard para evitar layout shift
- Estado del mapa persistido en URL query params (`?lat=&lng=&z=&search=`)
- El formulario de cliente/prospecto incluye mapa con geolocalización (Nominatim)
- El campo ESTATUS se oculta al crear clientes/prospectos (siempre ACTIVO por defecto)
