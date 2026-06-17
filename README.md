# EMVIAL Geo

Aplicacion de escritorio para carga, visualizacion, control y exportacion de
intervenciones territoriales de EMVIAL.

La app permite registrar intervenciones sobre un mapa, trabajar con puntos,
lineas y poligonos, filtrar por periodo/obra/barrio, importar y exportar datos
GIS, generar informes y administrar backups locales.

## Stack

- Electron para aplicacion de escritorio.
- React + Vite para la interfaz.
- Leaflet / React Leaflet para mapa.
- `sql.js` para persistencia SQLite local.
- Turf para calculos geograficos.
- PDF.js para cargar PDFs como guia visual.
- Exportaciones Excel, KML, GeoJSON y SHP.

## Requisitos

- Node.js compatible con las dependencias del proyecto.
- npm.
- Windows para instalador NSIS final.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Levantar Vite:

```bash
npm run dev
```

Levantar Electron en otra terminal:

```bash
npm run electron
```

Tambien se puede usar:

```bash
npm start
```

Ese comando ejecuta Vite y Electron en paralelo.

## Validacion

Ejecutar tests:

```bash
npm test
```

Ejecutar lint:

```bash
npm run lint
```

Ejecutar build web:

```bash
npm run build
```

Chequeo completo:

```bash
npm run check
```

## Build e instalador

Crear build e instalador Windows:

```bash
npm run dist:win
```

La salida se genera en:

```text
release/
```

La configuracion del instalador esta en `package.json`, seccion `build`.

Puntos importantes:

- `productName`: `EMVIAL Geo`.
- `appId`: `com.emvial.geo`.
- Target Windows: `nsis`.
- Icono: `public/icon.ico`.
- `deleteAppDataOnUninstall`: `true`.
- Crea acceso directo de escritorio y menu inicio.

## Persistencia local

La base viva se guarda en la carpeta `userData` de Electron.

En Windows normalmente queda bajo:

```text
%APPDATA%/EMVIAL Geo/
```

Archivos relevantes:

- `emvial.sqlite`: base principal.
- `config.json`: configuracion local, por ejemplo carpeta de backups.
- `geocoding-cache.json`: cache de busquedas geograficas.
- `logs/`: logs del proceso principal.

Importante: no conviene sincronizar directamente `emvial.sqlite` con OneDrive,
Google Drive u otro sistema cloud mientras la app esta en uso. Para resguardo
cloud es mejor sincronizar la carpeta de backups.

## Backups

La app contempla:

- Backup manual.
- Backup preventivo antes de restaurar o importar masivamente.
- Backup automatico cada 10 minutos solo si hubo cambios pendientes.
- Backup automatico general.
- Backup automatico por periodo.
- Restauracion completa.
- Restauracion de un periodo especifico.
- Seleccion de carpeta de backups.

Por defecto los backups viven dentro de `userData/backups`, salvo que el usuario
configure otra carpeta desde la app.

Nota sobre desinstalacion: el instalador tiene `deleteAppDataOnUninstall: true`.
Eso borra la carpeta `userData` al desinstalar. Si los backups siguen en la
carpeta por defecto, tambien pueden borrarse. Una carpeta de backups configurada
fuera de `userData` queda como resguardo independiente.

## Importacion GIS

La app puede importar:

- GeoJSON / JSON.
- KML.
- ZIP SHP.

Al importar, el sistema convierte geometria GIS a intervenciones internas:

- `Point` -> Punto.
- `LineString` -> Linea.
- `Polygon` -> Poligono.

El importador soporta alias de campos comunes y nombres cortos de SHP, por
ejemplo `m_lineal`, `m2`, `inspect`, `mes_term`.

Antes de una importacion masiva se crea un backup preventivo.

## Exportaciones

La app exporta:

- Excel: resumen, intervenciones y estadisticas.
- KML: compatible con Google Earth / My Maps.
- GeoJSON: formato GIS abierto.
- SHP ZIP: capas separadas para puntos, lineas y poligonos.
- Informe PDF del periodo desde vista imprimible.

Las exportaciones usan DTOs normalizados para evitar campos tecnicos como
`syncStatus`, `updatedBy`, `version` o marcadores internos de UI.

## Geocoding y OpenStreetMap

La app usa Nominatim/OpenStreetMap para busqueda y reverse geocoding desde el
proceso principal de Electron.

Medidas implementadas:

- Cache local en `geocoding-cache.json`.
- Rate limit aproximado de 1 consulta cada 1100 ms.
- Consultas progresivas orientadas a Mar del Plata.
- Limpieza manual de cache desde el dialogo Acerca de.

Uso responsable:

- Evitar cargas masivas de direcciones contra Nominatim publico.
- Mantener cache activo.
- Para uso intensivo o multiusuario, considerar un proveedor geocoding propio,
  pago, o una instancia controlada.
- Revisar la politica vigente del proveedor antes de una entrega productiva.

## Datos estaticos

Los datos grandes o estaticos se sirven desde `public/data`.

Ejemplos:

- Barrios.
- Calles de Mar del Plata.

Esto evita inflar el bundle principal y permite cargarlos bajo demanda.

## Tests actuales

La suite cubre, entre otros:

- Calculo de cuadras y red vial.
- DTOs de importacion/exportacion.
- Importacion GIS GeoJSON.
- Dominio de intervencion.
- Duplicado de intervenciones.
- Historial.
- Calidad de datos.
- Cache de geocoding.
- Estadisticas por periodo.

## Documentacion complementaria

- [Checklist de release](docs/release-checklist.md)
- [Build e instalador](docs/build-installer.md)
- [Preparacion multiusuario](docs/multiuser-readiness.md)
- [Contrato de intervencion](docs/intervention-contract.md)
- [Changelog](CHANGELOG.md)
