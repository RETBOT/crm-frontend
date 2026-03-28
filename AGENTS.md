# Agent Instructions - CRM Frontend

Este archivo define las reglas de documentacion que opencode debe seguir automaticamente al modificar codigo en este proyecto.

## Reglas generales

Cuando modifiques codigo en este proyecto, ejecuta las siguientes acciones automaticamente:

1. Actualiza `CHANGELOG.md` con el cambio realizado
2. Si el cambio agrega paginas, componentes, APIs o permisos, actualiza `README.md`

## Nuevas paginas

Cuando agregues una nueva pagina en `src/pages/dashboard/`:

- Agregar a `README.md` en la estructura del proyecto
- Definir la ruta en `src/routes.jsx`
- Si requiere permisos, agregar `requiredPermissions` en la ruta
- Agregar entrada a `CHANGELOG.md` bajo `### Added`

## Nuevos componentes

Cuando agregues un componente en `src/components/`:

- Exportar desde `src/components/index.js`
- Agregar a `README.md` en la seccion de componentes
- Agregar entrada a `CHANGELOG.md`

## Nuevas llamadas API

Cuando agregues una funcion en `src/api/`:

- Seguir el patron existente: axios + Bearer token + refreshToken en error 401
- Agregar a `README.md` si es un nuevo endpoint significativo
- Agregar entrada a `CHANGELOG.md`

## Nuevos permisos usados en frontend

Cuando uses `hasPermission()` en un componente nuevo:

- Agregar a `README.md` en la tabla de permisos:
  - Permiso (ej: `reports.export`)
  - Que controla (ej: `Boton Exportar en Reportes`)
- Agregar entrada a `CHANGELOG.md`

## Patron de componente reutilizable

Cuando crees un componente que se usa en multiples paginas (como `ActivityForm`, `ActivityList`):

- Crear en `src/components/[categoria]/[nombre].jsx`
- Exportar desde `src/components/index.js`
- Documentar props en el archivo del componente
- Agregar a `README.md`

## Formato CHANGELOG

Usar formato basado en Keep a Changelog:

```markdown
## [YYYY-MM-DD]

### Added
- Nueva pagina, componente o funcionalidad

### Changed
- Cambio a funcionalidad existente

### Fixed
- Correccion de bug o UX

### Removed
- Eliminacion de funcionalidad
```

## Estructura del proyecto

```
src/
├── api/                # Funciones axios por modulo
├── components/         # Componentes reutilizables
│   ├── accounts/       # Formularios y listas de clientes
│   └── notifications/  # Notificaciones toast
├── configs/            # Configuracion de graficos
├── pages/dashboard/    # Paginas principales
├── routes.jsx          # Rutas y menu lateral
└── utils/              # Utilidades (auth, helpers)
```

## Flujo de documentacion

Cuando termines una feature:

1. Ejecuta `git diff` para ver todos los cambios
2. Identifica que tipo de cambios son (endpoint, componente, pagina, permiso)
3. Actualiza `CHANGELOG.md` con las entradas correspondientes
4. Actualiza `README.md` si hay nuevas secciones o tablas
5. Commitea todo junto con mensaje descriptivo

## Flujo de git

### Commits
- Commitear despues de cada cambio logico (feature, fix, refactor)
- Mensaje descriptivo en inglés con prefijo: feat, fix, docs, refactor
- Actualizar CHANGELOG.md antes de commitear

### Push
- NO hacer push automatico despues de cada commit
- Solo hacer push cuando el usuario lo pida explicitamente con las palabras "commit y push" o "push"
- Si el usuario dice "commitea" o "documenta", solo commit sin push

### Ejemplo
- "arregla el bug de contactos" → commit local, sin push
- "agrega reportes" → commit local, sin push
- "commit y push" → push todos los pendientes en ambos proyectos
