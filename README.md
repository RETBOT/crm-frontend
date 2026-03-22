# CRM Frontend (React + Vite + Tailwind)

Frontend del sistema CRM construido con React, Vite y Material Tailwind.

## Requisitos

- Node.js 20+
- Backend CRM corriendo (por defecto en `http://localhost:3000`)

## Configuracion

1. Copiar `.env.example` a `.env` (si existe)
2. Configurar la URL del backend:

```
VITE_API_URL=http://localhost:3000/api/
```

3. Ejecutar:

```bash
npm install
npm run dev
```

## Estructura del proyecto

```
src/
├── api/                    # Funciones axios para cada modulo
│   ├── accounts.js         # Clientes, prospectos, contactos
│   ├── activities.js       # CRUD de actividades
│   ├── admin.js            # Usuarios, roles, permisos
│   ├── auth.js             # Login, refresh token
│   └── dashboard.js        # Panel de control, alertas vencidas
├── components/
│   ├── accounts/           # Formularios y listas reutilizables
│   │   ├── activityform.jsx
│   │   ├── activitylist.jsx
│   │   ├── contactform.jsx
│   │   └── customerform.jsx
│   └── notifications/      # Componentes de notificacion
├── configs/                # Configuracion de graficos
├── pages/dashboard/        # Paginas principales
│   ├── home.jsx            # Panel de control (KPIs, alertas)
│   ├── accounts.jsx        # Clientes
│   ├── prospects.jsx       # Prospectos
│   ├── activities.jsx      # Actividades
│   ├── contacts.jsx        # Contactos
│   ├── opportunities.jsx   # Oportunidades
│   ├── maps.jsx            # Mapa de clientes
│   └── admin-users-roles.jsx  # Administracion
├── routes.jsx              # Rutas y menu lateral
└── utils/auth.js           # Utilidades de autenticacion
```

## Funcionalidades principales

### Panel de Control (Dashboard)
- Tarjetas KPI: ventas del mes, meta, oportunidades ganadas, clientes nuevos
- Graficos: tendencia de ventas, oportunidades por estatus, actividades por estatus
- Tabla de oportunidades activas
- **Widget de alertas:** muestra actividades vencidas con contador y lista resumida

### Clientes y Prospectos
- Listado con busqueda, filtros (estatus, sucursal, ruta) y paginacion
- Crear, editar, eliminar clientes/prospectos
- Convertir prospecto a cliente
- Tab de contactos con CRUD
- Tab de actividades por cliente

### Actividades
- Listado con filtros por estatus (Pendiente, Programada, Vencidas, Completada, Cancelada)
- Busqueda con debounce
- Crear actividad con selector de cliente
- Editar, completar, cancelar actividades
- **Highlight visual** de actividades vencidas (borde rojo, fecha roja, badge de dias)
- Filtro "Vencidas" para mostrar solo actividades con fecha pasada

### Mapa
- Mapa interactivo con markers de clientes (Leaflet + OpenStreetMap)
- Clustering automatico de markers
- Filtros: busqueda, estatus, sucursal, ruta
- Click en cliente centra el mapa y abre popup
- Fallback a Google Maps para clientes sin coordenadas

### Administracion
- Crear/eliminar usuarios
- Asignar roles a usuarios
- Crear/eliminar roles
- Asignar permisos a roles (con descripcion y ubicacion)
- Configurar alcance de datos (ALL/BRANCH/ROUTE) por usuario

## Sistema de permisos

Los permisos controlan acceso a funcionalidades. Solo el desarrollador crea permisos (via seed script SQL). El administrador los asigna a roles desde la UI.

| Permiso | Controla |
|---------|----------|
| `users.manage` | Crear usuarios |
| `roles.manage` | Crear/editar/eliminar roles y permisos |
| `scope.manage` | Configurar alcance de datos |
| `customers.create` | Boton "Nuevo cliente" |
| `customers.update` | Boton "Editar" en clientes |
| `customers.delete` | Boton "Inactivar" en clientes |
| `prospects.create` | Boton "Nuevo prospecto" |
| `prospects.update` | Boton "Editar" en prospectos |
| `prospects.delete` | Boton "Inactivar" en prospectos |
| `prospects.convert` | Boton "Convertir a cliente" |
| `activities.create` | Boton "Nueva Actividad" |
| `activities.update` | Boton "Editar" en actividades |
| `activities.complete` | Botones "Completar"/"Cancelar" |

## Build

```bash
npm run build
```

El output se genera en `dist/`.

## Notas

- La autenticacion usa JWT con refresh token automatico
- El menu lateral filtra opciones segun permisos del usuario
- Las actividades cambian a "Programada" automaticamente al asignar fecha
- Actividades vencidas se muestran con highlight rojo en todas las vistas
- El dashboard carga alertas de vencidas en paralelo con los KPIs
