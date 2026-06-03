# EMVIAL Geo

Aplicación de escritorio para carga, visualización y exportación de intervenciones territoriales de EMVIAL.

La app permite registrar intervenciones sobre un mapa, trabajar con puntos/líneas/polígonos, filtrar por período/obra/estado, exportar datos y usar PDFs o capturas como “hoja de calcar” sobre el mapa para cargar información territorial que llega en formatos heterogéneos.

## Objetivo operativo

EMVIAL Geo busca nuclear en una herramienta local el proceso de carga de partes, PDFs, capturas de mapa, y registros operativos. El foco no es reemplazar un GIS completo, sino facilitar una carga ordenada, visual y exportable hacia herramientas como My Maps, Tableau o planillas.

## Stack principal

- Electron para aplicación de escritorio.
- React + Vite para interfaz.
- Leaflet / React Leaflet para mapa.
- SQLite mediante `sql.js` para persistencia local.
- PDF.js para convertir PDFs en imagen guía.
- Exportaciones a Excel/KML desde servicios del renderer.

## Flujo básico de uso

1. Seleccionar período activo.
2. Cargar datos de intervención en el formulario.
3. Elegir tipo de geometría: punto, línea o polígono.
4. Dibujar sobre el mapa.
5. Opcionalmente cargar PDF/imagen guía para calcar.
6. Guardar intervención.
7. Filtrar, editar, eliminar/restaurar o exportar.

## Imagen guía / hoja de calcar

La app soporta cargar:

- PDF
- PNG
- JPG/JPEG
- WEBP
- capturas de Google Maps
- croquis o imágenes enviadas por WhatsApp

El archivo se muestra como overlay semitransparente sobre Leaflet. Se puede mover, escalar, rotar, bloquear, ocultar, quitar y usar el nombre del archivo como fuente de la intervención.

## Persistencia

La base viva se guarda localmente en la carpeta `userData` de Electron. La información se persiste en SQLite usando `sql.js`.

Importante: la base viva no debe sincronizarse directamente con OneDrive/Google Drive. Para respaldo cloud conviene sincronizar la carpeta de backups, no el archivo SQLite en uso.

## Backups

La app incluye:

- backup manual;
- backup general automático;
- backup automático por período;
- restauración completa;
- restauración parcial por período;
- selección de carpeta de backups.

## Exportaciones

Actualmente la app contempla exportaciones a:

- Excel;
- KML.

La exportación KML es útil para My Maps / Google Earth. La exportación Excel sirve como base para análisis tabular o carga posterior en otras herramientas.

## Estructura general

```text
├── assets
│   ├── hero.png
│   └── map-pin.svg
├── components
│   ├── common
│   │   ├── states
│   │   │   ├── AppError.jsx
│   │   │   ├── AppLoader.jsx
│   │   │   └── AppSplash.jsx
│   │   ├── AboutDialog.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── Toast.jsx
│   ├── form
│   │   ├── AddressSearch.jsx
│   │   └── InterventionForm.jsx
│   ├── layout
│   │   ├── AssetsPanel.jsx
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   ├── map
│   │   ├── ClickMapa.jsx
│   │   ├── ControlBarrio.jsx
│   │   ├── GeometryControl.jsx
│   │   ├── GeometryPreview.jsx
│   │   ├── GuideImageOverlay.jsx
│   │   ├── GuideOverlayControls.jsx
│   │   ├── IntervencionesLayer.jsx
│   │   ├── MapActions.jsx
│   │   ├── MapBarrioFocus.jsx
│   │   ├── MapCenter.jsx
│   │   ├── MapFocus.jsx
│   │   ├── MapInvalidator.jsx
│   │   ├── MapStatsPanel.jsx
│   │   ├── MapView.jsx
│   │   └── PopupIntervencion.jsx
│   └── topbar
│       ├── TopbarFilters.jsx
│       ├── TopbarMenu.jsx
│       └── TopbarTitle.jsx
├── constants
│   ├── formInicial.js
│   └── intervenciones.js
├── data
│   └── barrios.geojson
├── hooks
│   ├── app
│   │   ├── actions
│   │   │   ├── useAppActions.js
│   │   │   ├── useAssetActions.js
│   │   │   └── useTopbarActions.js
│   │   ├── core
│   │   │   ├── useAppActionsBundle.js
│   │   │   ├── useAppData.js
│   │   │   ├── useAppForm.js
│   │   │   ├── useAppServices.js
│   │   │   └── useAppUI.js
│   │   ├── dialogs
│   │   │   └── useAboutDialog.js
│   │   ├── effects
│   │   │   ├── useAppCloseProtection.js
│   │   │   └── useKeyboardShortcuts.js
│   │   └── useAppComponentProps.js
│   ├── data
│   │   ├── useBackups.js
│   │   ├── useFiltrosIntervenciones.js
│   │   ├── useIntervenciones.js
│   │   └── usePeriodo.js
│   ├── form
│   │   ├── useFormularioIntervencion.js
│   │   └── useGeocoding.js
│   ├── map
│   │   ├── useGeometryEditing.js
│   │   ├── useGuideOverlay.js
│   │   ├── useGuideOverlayWithSource.js
│   │   └── useMapStatsDetail.js
│   ├── props
│   │   ├── useAssetsPanelProps.js
│   │   ├── useMapProps.js
│   │   ├── useSidebarProps.js
│   │   └── useTopbarProps.js
│   └── ui
│       ├── useConfirmDialog.js
│       ├── useDebouncedValue.js
│       ├── useSplashScreen.js
│       ├── useToast.js
│       └── useUIState.js
├── map
│   ├── config
│   │   ├── mapColors.js
│   │   └── mapIcons.js
│   └── data
│       ├── barrios.js
│       ├── mapStats.js
│       └── mapViewData.js
├── services
│   ├── exportExcel.js
│   └── exportKML.js
├── styles
│   ├── base
│   │   ├── scrollbar.css
│   │   └── theme.css
│   ├── components
│   │   ├── appsplash.css
│   │   ├── boot.css
│   │   ├── confirm-dialog.css
│   │   └── toast.css
│   ├── layout
│   │   ├── layout.css
│   │   ├── panel.css
│   │   ├── responsive.css
│   │   ├── sidebar.css
│   │   └── topbar.css
│   └── map
│       ├── drawing.css
│       ├── guide-overlay.css
│       ├── leaflet-overrides.css
│       ├── map-actions.css
│       ├── map-popup.css
│       ├── map-stats.css
│       └── map.css
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```