# Arquitectura tecnica - EMVIAL Geo

EMVIAL Geo es una aplicacion de escritorio local-first para registrar,
visualizar, auditar, importar y exportar intervenciones territoriales.

La arquitectura actual prioriza:

- operacion local sin servidor obligatorio;
- datos persistidos en SQLite mediante `sql.js`;
- backups preventivos, manuales y automaticos;
- exportaciones GIS y administrativas;
- validacion en la frontera Electron/renderer;
- preparacion ordenada para una futura sincronizacion multiusuario.

## Capas principales

```text
Electron
  main.js
  preload.js
  database.js
  validation.js
  geocoding/
  db/
  backups/

React
  components/
  hooks/
  services/
  domain/
  map/
  styles/

Datos estaticos
  public/data/barrios.geojson
  public/data/calles-mar-del-plata.geojson

Tests
  tests/*.test.mjs
```

## Electron

Electron es la capa nativa y de confianza. El renderer no accede a Node ni al
sistema de archivos de forma directa.

### `electron/main.js`

Responsabilidades:

- crear la ventana principal;
- cargar Vite en desarrollo o `dist/index.html` en produccion;
- configurar permisos y navegacion segura;
- registrar canales IPC;
- delegar geocoding a Nominatim desde el proceso principal;
- validar payloads antes de persistir;
- proteger el cierre accidental de la app.

Configuracion importante:

- `contextIsolation: true`;
- `nodeIntegration: false`;
- `sandbox: true`;
- CSP en produccion;
- bloqueo de permisos del navegador;
- apertura de URLs externas mediante `shell.openExternal`.

### `electron/preload.js`

Expone una API minima en `window.api`.

El renderer puede pedir operaciones como:

- guardar/listar/eliminar intervenciones;
- importar datos estaticos;
- crear/restaurar backups;
- buscar direcciones;
- consultar estado tecnico de la app.

No se expone `ipcRenderer` completo.

Los nombres de canales IPC viven en `electron/ipc/channels.js`. `main.js` y
`preload.js` usan esas constantes compartidas para evitar drift entre handlers
y llamadas desde el renderer.

### `electron/validation.js`

Es la frontera de datos entre React y Electron.

Normaliza y valida:

- periodo `YYYY-MM`;
- ids;
- archivos estaticos permitidos;
- tipo de geometria;
- geometria minima para punto, linea y poligono;
- coordenadas;
- fechas;
- version;
- campos de texto;
- estado fijo `Finalizada`.

Tambien evita que campos internos no permitidos pasen a persistencia.

### `electron/database.js`

Es la fachada de persistencia local que consumen los handlers IPC. Sus
responsabilidades principales son:

- iniciar `sql.js`;
- crear y migrar tablas;
- guardar el archivo SQLite;
- marcar cambios pendientes para backup automatico;
- exponer estado tecnico para diagnostico.

La lectura/escritura de intervenciones, el historial y las operaciones de
backup/restauracion viven en modulos dedicados para mantener bajo el acoplamiento
del archivo principal.

### `electron/db`

Contiene la capa local de datos:

- `schema.js`: crea y migra tablas SQLite.
- `intervencionesRepository.js`: lista, crea, edita, elimina e importa
  intervenciones en lote.
- `historialRepository.js`: registra y lee historial auditable.
- `historyChanges.js`: calcula diferencias y separa metadata interna antes de
  persistir.

### `electron/backups`

Contiene la politica de backups y restauracion:

- `backupConfig.js`: carpeta activa, configuracion local y validacion de rutas.
- `backupService.js`: nombres, limpieza y copias generales/preventivas.
- `backupOperations.js`: backup manual, backup automatico por periodo y
  restauraciones completas o por periodo.
- `backupUtils.js`: utilidades de carpetas.

## Persistencia

La base viva queda en:

```text
app.getPath('userData')/emvial.sqlite
```

SQLite almacena intervenciones como JSON dentro de la tabla `intervenciones`.
Esto permite evolucionar campos con menos migraciones rigidas, manteniendo una
tabla simple y exportable.

El historial vive en `historial_cambios` y registra:

- accion;
- intervencion asociada;
- diferencias;
- fecha.

## Backups

La app usa un sistema con cambios pendientes:

1. Crear, editar o eliminar marca la base como `dirty`.
2. Un programador intenta backup automatico cada 10 minutos.
3. Si `dirty=true`, guarda archivo, crea backup general y backups por periodo.
4. Si todo sale bien, limpia el estado pendiente.

Ademas existen:

- backup manual;
- backup preventivo antes de restaurar;
- backup preventivo antes de importaciones masivas;
- restauracion completa;
- restauracion de periodo.

La carpeta de backups puede cambiarse desde la app. La base viva no se mueve:
siempre queda dentro de `userData`.

## React

React representa interfaz, estado de interaccion y coordinacion de servicios.

### `App.jsx`

Es deliberadamente liviano. Compone:

- sidebar de carga;
- topbar;
- mapa;
- panel de intervenciones;
- toast;
- dialogos globales;
- splash.

La logica vive en `useAppServices`.

### `hooks/app/core`

Controladores principales:

- `useAppServices`: ensambla la app.
- `useAppUI`: estado visual global.
- `useAppData`: intervenciones, periodo, filtros y backups.
- `useAppForm`: formulario, geocoding e imagen guia.
- `useAppActionsBundle`: acciones globales.

### `hooks/app/actions`

Contiene acciones disparadas desde UI:

- exportar/importar;
- backups;
- restauracion;
- edicion;
- foco;
- duplicado;
- eliminacion protegida.

El menu superior se divide en:

- `useExportActions`: Excel, KML, GeoJSON, SHP e informe PDF.
- `useImportActions`: importacion GIS con preview y backup preventivo.
- `useBackupMenuActions`: backup manual, restauraciones, carpeta de backups y
  About.
- `useTopbarActions`: fachada que conserva la API que consume la UI.

### `hooks/form`

Controla el formulario de intervencion. La regla objetivo es que el hook
principal coordine y que los subhooks se encarguen de:

- metricas de geometria;
- ubicacion automatica por red vial;
- estado de ubicacion manual/automatica de lineas;
- validacion de geometria;
- dirty state;
- envio/edicion/cancelacion.

Piezas principales:

- `useFormularioIntervencion`: orquestador publico.
- `useGeometryMetricsForm`: metricas automaticas.
- `useStreetAutoLocation`: ubicacion por red vial.
- `useLineLocationState`: estado de ubicacion de lineas.
- `useInterventionFormActions`: guardar, editar y cancelar.

## Dominio

`src/domain` define reglas puras y reutilizables:

- normalizacion de intervenciones;
- tipos de geometria;
- metricas visibles;
- detalle para UI;
- duplicado seguro;
- periodo.

Estas funciones son testeables sin React ni Electron.

## Mapa

La capa de mapa usa Leaflet/React Leaflet.

Incluye:

- capa base OpenStreetMap;
- barrios GeoJSON;
- selector de barrio;
- dibujo de punto, linea y poligono;
- preview de geometria;
- intervenciones guardadas;
- foco desde listado o popup;
- imagen/PDF guia;
- acciones y estadisticas compactas.

Los barrios se cargan desde `public/data` para no inflar el bundle principal.

## Red vial y cuadras

La red de calles se carga desde:

```text
public/data/calles-mar-del-plata.geojson
```

El calculo de cuadras y ubicacion de lineas se realiza en worker cuando el
entorno lo permite.

El flujo general:

1. El usuario dibuja una linea.
2. Se calcula longitud geometrica.
3. Se consulta la red vial local.
4. Se detectan calle principal, alturas e intersecciones.
5. Se estima cantidad de cuadras segun interferencias reales.
6. Si la linea dobla hacia otra calle, se informa con toast.

## Exportaciones e importaciones

Las exportaciones usan DTOs estables para evitar campos internos.

Formatos:

- Excel;
- KML;
- GeoJSON;
- SHP ZIP;
- informe PDF.

Las importaciones GIS soportan:

- GeoJSON/JSON;
- KML;
- ZIP SHP.

Antes de importaciones masivas se crea backup preventivo.

## Workers

Se usan workers para evitar bloquear la UI:

- `dataQuality.worker.js`: auditoria de calidad.
- `callesMetrics.worker.js`: calculo de red vial/cuadras.

Si el worker falla o no existe, los servicios tienen fallback en el hilo
principal.

## Geocoding

La busqueda geografica usa Nominatim/OpenStreetMap desde Electron.

Medidas actuales:

- cache local;
- TTL de cache;
- limite de entradas;
- rate limit aproximado;
- user agent propio;
- limpieza manual desde Acerca de.

Para uso intensivo o multiusuario conviene evaluar proveedor dedicado o cache
compartido.

## Estilos

Los estilos estan organizados por responsabilidad:

```text
styles/base
styles/layout
styles/map
styles/components
```

`theme.css` centraliza variables base y tokens de accion.

## Tests

La suite actual cubre:

- dominio de intervencion;
- duplicado;
- DTOs de import/export;
- importacion GIS;
- red vial/cuadras;
- calidad de datos;
- historial;
- geocoding cache;
- estadisticas;
- validacion Electron;
- contrato IPC/preload;
- helpers de menu superior;
- adaptador de sincronizacion.

Comando:

```bash
npm test
```

## Riesgos tecnicos actuales

1. El mapa renderiza todas las intervenciones visibles; con muchos registros
   puede requerir clustering o simplificacion.
2. El panel de intervenciones usa `content-visibility`, pero no virtualizacion
   real.
3. `sql.js` exporta el archivo completo al guardar; para la escala actual sirve,
   pero conviene medir si la base crece mucho.
4. Multiusuario requiere backend remoto y control de conflictos; no conviene
   compartir el SQLite vivo.

## Regla de arquitectura

```text
Componentes -> renderizan
Hooks -> coordinan estado y comportamiento
Domain -> reglas puras del negocio
Services -> transforman, importan, exportan o calculan
Repositories -> adaptan persistencia
Electron -> filesystem, DB, IPC y sistema operativo
```

El renderer consume intervenciones mediante `src/repositories`. El contrato
minimo esta en `intervencionesRepositoryContract.mjs`, lo que permite reemplazar
la implementacion local por un repositorio remoto manteniendo los hooks de UI.

## Proximos refactors recomendados

1. Terminar de fragmentar `useFormularioIntervencion`.
2. Agregar test de humo Electron con runtime real si se quiere cubrir apertura
   de ventana.
3. Preparar repositorio remoto para futura sincronizacion.
4. Evaluar tablas auxiliares normalizadas para reportes mas complejos.
5. Revisar virtualizacion del panel si la cantidad de intervenciones crece.
