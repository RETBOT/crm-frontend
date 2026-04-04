# Changelog

Todas las fechas notables en este proyecto seran documentadas en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added
- Check-in GPS con modal de mapa para completar Visita/Reunion
  - Marcador arrastrable con límite de 200m desde posición GPS inicial
  - Indicador de precisión GPS (verde <50m, amarillo 50-150m, ámbar >150m)
  - Botón "Recalcular ubicación" para refrescar lectura GPS
  - Notas obligatorias para Visita/Reunion (mínimo 10 caracteres)
  - Botón "Completar sin ubicación" como fallback cuando falla GPS
  - Notas se append al campo existente con separador `--- Check-in ---`
- Tab "Check-ins" en mapa con filtros de fecha y tipo de actividad
  - Lista de check-ins con nombre, tipo, usuario y fecha
  - Click en check-in vuela el mapa a esa ubicación
  - Notas del check-in se muestran en la lista
  - Seguridad automática: respeta scope del usuario (ALL/BRANCH/ROUTE)
- Componente `CheckinFlyTo` para navegación al hacer clic en check-in
- Componente `CheckinModal` con mapa Leaflet, marcador draggable y campo de notas
- API `getActividadesCheckins(filtros)` con filtros FROM_DATE, TO_DATE, TYPE, USER_ID

### Changed
- Mapa: sidebar reorganizado con tabs "Clientes" / "Check-ins" en vez de checkbox
- `activitylist.jsx`: botón "Completar con check-in" para Visita/Reunion
- `completarActividad` acepta notas como 5to parámetro
- Filtro de sucursal en mapa corregido: envía ID en vez de nombre
- `getActividadesCheckins` ahora envía filtro TYPE al backend
- `maps.jsx`: `CheckinsLayer` solo se renderiza cuando tab "Check-ins" está activa

### Fixed
- Filtro de sucursal en mapa: ahora compara `SUCURSALID` en vez de `SUCURSAL`
- Click en check-in del mapa ahora navega correctamente a la ubicación
- Notas del check-in ahora se muestran en la lista del mapa
- Filtro de tipo de actividad en check-ins ahora se envía al backend
- `CheckinFlyTo` ya no se borra inmediatamente al seleccionar check-in
- Bug crítico en contactos: `CLIENTEID` se enviaba como PK numérico (5) en vez de customer_code ("100001") → "No tiene acceso a este cliente/prospecto"
- Bug en contactos: doble fetch al cargar la página
- Bug en contactos: sin estado `saving` en ContactForm
- Bug en contactos: sin permisos `hasPermission()` en botones de crear/editar/eliminar
- Bug en contactos: sin validación de `response.resultado === 1`
- Bug en actividades: filtro de responsable no aparecía (bloqueado por `canAssign`)
- Bug en actividades: fechas del filtro incluían día anterior por diferencia UTC/local
- Bug en actividades: `getActivityUsersHandler` backend usaba `_req` pero referenciaba `req`
- Bug en accounts.jsx: link de WhatsApp no limpiaba caracteres no numéricos
- Bug en oportunidades: `updateOpportunity` no cargaba items existentes al editar
- Bug en oportunidades: monto permitía valores negativos
- Bug en oportunidades: fecha permitía fechas pasadas
- Bug en oportunidades: contactos mostraba todos los clientes en vez de solo los del cliente seleccionado
- Bug en oportunidades: `handleUpdate` no cerraba el formulario tras actualizar
- Bug en oportunidades: fecha mínima usaba UTC en vez de hora local → bloqueaba día actual
- Bug en oportunidades: `stage_id` NULL en UPDATE porque SELECT no lo incluía
- Mejoras en actividades: filtros avanzados (tipo, cliente, prioridad, responsable, rango de fechas)
- Mejoras en actividades: ordenamiento por columnas (fecha, prioridad, estado)
- Mejoras en actividades: panel de detalle como drawer lateral
- Mejoras en actividades: paginación configurable (10, 20, 50, 100)
- Mejoras en actividades: sticky header de tabla
- Mejoras en actividades: fix conflicto visual vencida/seleccionada
- Mejoras en oportunidades: eliminar con confirmación, filtros, ordenamiento, paginación

---

### Added
- Buscador de direcciones con geocoding Nominatim en mapa de formulario de clientes
- Auto-llenado del buscador con los campos de direccion del formulario
- Mapa interactivo (Leaflet) en formulario de clientes para seleccionar coordenadas por click/arrastrar
- Componente `CoordinatePicker` con marcador draggable y click-to-place
- Texto legible de coordenadas debajo del mapa
- Reset de contrasena desde panel de admin: campo de nueva contrasena + boton "Resetear contrasena"
- API `resetAdminUserPassword(userId, password)`
- Bell icon en navbar con badge contador de notificaciones no leidas
- Dropdown de notificaciones con tipos: asignada (azul), proxima a vencer (amarillo), vencida (rojo)
- Marcar notificacion como leida al hacer click
- Boton "Marcar todas como leidas"
- Contexto global `NotificationProvider` con polling cada 30 segundos
- API `notifications.js`: getNotifications, getNotificationsBadge, markNotificationRead, markAllNotificationsRead
- Selector de asignado en `ActivityForm` cuando usuario tiene permiso `activities.assign`
- API `getActivityUsers()` para obtener usuarios de la sucursal
- `ActivityList` y `Activities` cargan usuarios si tienen permiso `activities.assign`
- Soporte para módulos de productos y oportunidades con nuevos permisos

### Changed
- `ActivityForm` acepta prop `assigneeList` y muestra dropdown "Asignar a" (con opcion "Asignarme a mi")
- Payload de creacion incluye `OWNER_USER_ID` opcional
- `RoleManagement`: mapeo de permisos del backend (array de strings) a IDs numéricos
- `UserManagement`: compatibilidad con formato de permisos del backend

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
- `contacts.jsx` completamente reconectado a API (antes era placeholder con datos hardcodeados)
- Ahora: selector de cliente, busqueda, CRUD completo (crear/editar/eliminar)
- Boton "Crear Actividad" funcional desde contacto (pre-llena customerId y contactId)
- `contactform.jsx`: campos de nombre ahora editables al modificar contacto
- `activities.jsx`: carga contactos del cliente seleccionado + pasa al ActivityForm
- `ActivityForm`: acepta `onCustomerChange` callback para cargar contactos dinamicamente

### Fixed
- Contactos: botones Editar/Eliminar/Crear Actividad ahora funcionan
- `contactform.jsx`: nombres de contacto deshabilitados al editar (bug corregido)
- Activities page: dropdown de contactos ahora aparece al seleccionar cliente
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
