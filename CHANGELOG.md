# Changelog

Todas las fechas notables en este proyecto seran documentadas en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added
- Bell icon en navbar con badge contador de notificaciones no leidas
- Dropdown de notificaciones con tipos: asignada (azul), proxima a vencer (amarillo), vencida (rojo)
- Marcar notificacion como leida al hacer click
- Boton "Marcar todas como leidas"
- Contexto global `NotificationProvider` con polling cada 30 segundos
- API `notifications.js`: getNotifications, getNotificationsBadge, markNotificationRead, markAllNotificationsRead
- Selector de asignado en `ActivityForm` cuando usuario tiene permiso `activities.assign`
- API `getActivityUsers()` para obtener usuarios de la sucursal
- `ActivityList` y `Activities` cargan usuarios si tienen permiso `activities.assign`

### Changed
- `ActivityForm` acepta prop `assigneeList` y muestra dropdown "Asignar a" (con opcion "Asignarme a mi")
- Payload de creacion incluye `OWNER_USER_ID` opcional

---

## [2026-03-22]

### Added
- Gestion de permisos desde admin UI: tabla de permisos con clave, descripcion y ubicacion
- Widget de alertas de actividades vencidas en dashboard
  - Contador de vencidas con icono de alerta
  - Lista de top 5 vencidas con dias de retraso
  - Link "Ver todas" que filtra por VENCIDA
- Highlight visual de actividades vencidas en tabla principal
  - Fondo rojo claro, borde izquierdo rojo
  - Fecha en rojo + badge "Xd" con dias de retraso
- Highlight visual de actividades vencidas en `ActivityList` (tabs de clientes/prospectos)
- Filtro "Vencidas" en pagina de actividades
- Selector de cliente en `ActivityForm` para pantalla principal
- Helpers `isOverdue()` y `daysOverdue()` reutilizables
- `AGENTS.md` con instrucciones de documentacion automatica
- `CHANGELOG.md` con historial de cambios
- `README.md` con documentacion completa del proyecto

### Changed
- Admin UI: tabla de permisos es solo lectura con columna "Ubicacion"
- Admin UI: eliminado formulario de crear/eliminar permisos
- Admin UI: checkboxes muestran descripcion legible en vez de clave tecnica
- ActivityList: gating frontend con `hasPermission` (activities.create, activities.complete)
- Activities page: gating frontend con `hasPermission` (create, update, complete)
- Dashboard home: carga alertas vencidas en paralelo con KPIs

### Fixed
- ActivityForm ahora valida que se seleccione un cliente antes de enviar
- Error "No tiene acceso a este cliente" al crear actividad sin cliente seleccionado

---

## [2026-03-22 (anterior)]

### Added
- Integracion completa de actividades con backend API
  - Pagina principal de actividades conectada a API real
  - CRUD: crear, editar, completar, cancelar
  - Filtros por status con busqueda debounce
  - Paginacion
- `ActivityForm`: formulario reutilizable para crear/editar actividades
- `ActivityList`: componente reutilizable para tab de actividades en clientes/prospectos
- API `activities.js`: 5 funciones (listar, crear, actualizar, completar, tipos)
- Clustering de markers en mapa (leaflet.markercluster)
  - `MarkerClusterLayer` componente nativo con Leaflet
  - `zoomToShowLayer` al seleccionar cliente
  - `fitBounds` automatico con clientes con coordenadas
- Exports de componentes en `components/index.js`

### Changed
- Accounts: tab "Actividades" reemplazado por componente `ActivityList`
- Prospects: tab "Actividades" reemplazado por componente `ActivityList`
- Map: eliminados `Marker`/`Popup` de react-leaflet, reemplazado por clustering nativo

---

## [2026-03-21]

### Added
- Carga dinamica de posiciones de contacto en formularios
- Dashboard home conectado a metricas del backend
  - 4 cards KPI (ventas, meta, oportunidades, clientes)
  - 3 graficos (tendencia, oportunidades, actividades)
  - Tabla de oportunidades activas
  - Sidebar de actividades recientes

### Changed
- ContactForm: posiciones cargadas desde API en vez de hardcoded

---

## [2026-03-20]

### Added
- Pagina de administracion de usuarios y roles
  - Crear usuario con roles
  - Asignar/quitar roles a usuarios
  - Crear/eliminar roles con permisos
  - Configurar alcance de datos (ALL/BRANCH/ROUTE) por usuario
  - Checkboxes de permisos por rol
- API `admin.js`: funciones para usuarios, roles, permisos, alcance
- Filtros de menu lateral segun permisos (`requiredPermissions` en routes)
- Sistema de permisos frontend: `hasPermission()`, `hasAnyPermission()`

### Changed
- Sidenav: filtra items del menu segun permisos del usuario

---

## [2026-03-19]

### Added
- Login con JWT y refresh token automatico
- CRUD de clientes y prospectos con formularios
- CRUD de contactos dentro de clientes
- Mapa de clientes con Leaflet + OpenStreetMap
  - Markers por cliente con coordenadas
  - Filtros: busqueda, status, sucursal, ruta
  - Paginacion
  - Fallback a Google Maps por direccion
- Oportunidades por cliente
- Pagina de contactos independientes
- Pagina de oportunidades
