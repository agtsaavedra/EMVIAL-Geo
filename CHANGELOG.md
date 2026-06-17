# Changelog

Todos los cambios relevantes de EMVIAL Geo se documentan en este archivo.

## Unreleased

### Agregado

- Exportacion GIS en formatos GeoJSON, KML y SHP.
- Importacion GIS desde GeoJSON, KML y ZIP SHP.
- Informe PDF del periodo con vista descargable.
- Dashboard mensual ampliado.
- Modo consulta para inspeccionar intervenciones sin editar geometria.
- Historial descriptivo por intervencion con modal dedicado.
- Calculo de ubicacion y cuadras usando red de calles local.
- Cache, rate limit y diagnostico para geocodificacion.
- Tests unitarios para dominio, importacion, exportacion, red de calles, historial y acciones.

### Cambiado

- Estado de intervenciones fijado como `Finalizada`.
- Paneles laterales y panel inferior con comportamiento responsive refinado.
- Backups automaticos pasan a ejecutarse por cambios pendientes.
- Exportaciones usan DTOs estables sin campos internos.
- Formulario conserva ubicaciones editadas manualmente hasta recalcular.
- La validacion Electron normaliza datos antes de persistir.

### Corregido

- Scrolls dobles en modales.
- Advertencias de accesibilidad por `aria-hidden` e `inert`.
- Recalculo de ubicacion en lineas con mas de dos puntos.
- Cache y fallbacks para archivos GeoJSON locales.
