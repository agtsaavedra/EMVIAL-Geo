# Arquitectura técnica — EMVIAL Geo

## Vista general

La aplicación está separada en cuatro capas principales:

```text
Electron
  ├─ main.js
  ├─ preload.js
  └─ database.js

React
  ├─ components
  ├─ hooks
  ├─ services
  ├─ map
  └─ styles
```

## Electron

Electron funciona como capa nativa y segura.

### `main.js`

Responsabilidades:

- crear la ventana principal;
- configurar preload;
- registrar handlers IPC;
- manejar geocoding;
- proteger cierre accidental de la app;
- exponer operaciones de base/backups al renderer.

### `preload.js`

Responsabilidades:

- exponer una API limitada en `window.api`;
- evitar que React acceda directamente a Node;
- mantener `contextIsolation: true`.

### `database.js`

Responsabilidades:

- inicializar SQLite con `sql.js`;
- guardar y recuperar intervenciones;
- crear backups automáticos/manuales;
- restaurar backups;
- configurar carpeta de backups;
- exponer estado interno de rutas para diagnóstico.

## React

React representa la interfaz y el estado de interacción.

### `App.jsx`

Después del refactor, `App.jsx` quedó como componente de layout. No concentra lógica de negocio: consume `useAppServices` y renderiza la composición principal.

### `hooks/app/core`

Agrupa los controladores centrales:

- `useAppServices`: ensamblador principal.
- `useAppUI`: estado visual y utilidades UI.
- `useAppData`: intervenciones, período, backups y filtros.
- `useAppForm`: formulario, geocoding y guía.
- `useAppActionsBundle`: acciones globales, atajos, cierre protegido y about.

### `hooks/app/actions`

Agrupa acciones de negocio de la app:

- edición/enfoque/cambio de período;
- acciones del topbar;
- acciones del panel de intervenciones.

### `hooks/app/effects`

Agrupa efectos globales:

- atajos de teclado;
- protección de cierre.

### `hooks/app/dialogs`

Agrupa lógica de modales específicos como “Acerca de”.

## Datos

### Intervenciones

Una intervención es el objeto central del sistema. Contiene datos administrativos, estado, fuente y geometría.

La geometría puede ser:

- `punto`;
- `linea`;
- `poligono`.

## Mapa

La capa de mapa combina:

- barrios reales desde GeoJSON;
- intervenciones visibles;
- foco/centrado;
- preview de geometrías;
- acciones de dibujo;
- panel de estadísticas;
- imagen/PDF guía.

## Imagen guía

La imagen guía funciona así:

```text
PDF/imagen
↓
useGuideOverlay
↓
si es PDF: PDF.js renderiza la primera página a canvas
↓
se genera objectURL
↓
GuideImageOverlay lo muestra sobre Leaflet
↓
GuideOverlayControls modifica bounds/opacidad/rotación/bloqueo
```

La rotación se aplica con CSS preservando el `transform` interno de Leaflet para evitar que la imagen salte de posición.

## Estilos

Los estilos se reorganizaron por responsabilidad:

```text
styles/
  base/
  layout/
  map/
  components/
```

Dentro de `styles/map` se separaron:

- `map.css`;
- `leaflet-overrides.css`;
- `map-actions.css`;
- `map-popup.css`;
- `map-stats.css`;
- `drawing.css`;
- `guide-overlay.css`.

## Regla de arquitectura

La app intenta mantener esta regla:

```text
Componentes → renderizan
Hooks → coordinan estado y comportamiento
Services → exportan o transforman datos
Electron → maneja sistema de archivos, DB e IPC
```

## Riesgos técnicos actuales

1. `sql.js` exporta la base completa al guardar; funciona bien para la escala actual, pero no conviene guardar archivos pesados dentro de SQLite.
2. Los backups automáticos se generan frecuentemente. Está limitado por limpieza de backups antiguos, pero a futuro podría aplicarse debounce.
3. La imagen guía se mantiene en memoria como objectURL. Ya se revoca al quitar/cambiar guía, pero no debería persistirse dentro de la DB.
4. Multiusuario requiere otra arquitectura; no conviene compartir el SQLite vivo.

## Decisiones correctas actuales

- Mantener app local-first.
- Usar backups en carpeta sincronizable en vez de sincronizar la DB viva.
- No intentar interpretar PDFs automáticamente todavía.
- Resolver la carga visual con hoja de calcar.
- Mantener exportaciones separadas como services.
