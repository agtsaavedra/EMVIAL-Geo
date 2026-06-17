# Checklist de release

Usar este checklist antes de entregar una version instalable de EMVIAL Geo.

## 1. Preparacion

- Confirmar que la rama de trabajo corresponde a la version a entregar.
- Revisar que no haya cambios locales inesperados.
- Confirmar version en `package.json`.
- Confirmar `productName` y `appId` en `package.json`.
- Confirmar que `public/icon.ico` existe y corresponde a la app.

## 2. Validacion tecnica

Ejecutar:

```bash
npm test
npm run lint
npm run build
```

O directamente:

```bash
npm run check
```

La entrega no deberia avanzar si alguno falla.

## 3. Pruebas funcionales minimas

Probar en desarrollo o build:

- Crear intervencion de punto.
- Crear intervencion de linea.
- Crear intervencion de poligono.
- Editar una intervencion.
- Duplicar una intervencion.
- Eliminar y restaurar con toast.
- Abrir detalle de una intervencion.
- Abrir historial de una intervencion.
- Activar modo consulta y confirmar que bloquea edicion.
- Ver estadisticas del periodo.
- Ejecutar calidad de datos.

## 4. GIS y reportes

Probar exportacion:

- Excel.
- KML.
- GeoJSON.
- SHP ZIP.
- Informe PDF.

Probar importacion:

- GeoJSON.
- KML si hay archivo de prueba.
- SHP ZIP si hay archivo de prueba.

Confirmar que antes de importacion masiva se crea backup preventivo.

## 5. Backups

Probar:

- Crear backup manual.
- Abrir carpeta de backups.
- Configurar carpeta de backups fuera de `userData`.
- Restaurar backup completo en una copia de prueba.
- Restaurar solo un periodo en una copia de prueba.
- Confirmar que el backup automatico no se dispara en cada guardado, sino por
  cambios pendientes y programacion.

## 6. Geocoding

Probar:

- Buscar una direccion.
- Seleccionar sugerencia.
- Reverse geocoding desde click en mapa.
- Cache de geocoding en dialogo Acerca de.
- Limpiar cache.

Recordatorio:

- No hacer pruebas masivas contra Nominatim publico.
- Mantener cache activo.
- Para despliegue intensivo, evaluar proveedor/instancia geocoding propia.

## 7. Build instalable

Ejecutar:

```bash
npm run dist:win
```

Revisar salida en:

```text
release/
```

Instalar en una maquina de prueba o perfil de usuario limpio.

## 8. Prueba post-instalacion

Confirmar:

- Nombre visible: EMVIAL Geo.
- Icono correcto.
- Acceso directo en escritorio.
- Acceso directo en menu inicio.
- La app abre sin consola de desarrollo.
- La base se crea en `userData`.
- Los backups se crean correctamente.
- El mapa carga.
- No aparecen errores visibles en consola.

## 9. Desinstalacion

El instalador tiene:

```json
"deleteAppDataOnUninstall": true
```

Probar en entorno controlado:

- Desinstalar la app.
- Confirmar que se elimina `userData`.
- Confirmar que una carpeta de backups configurada fuera de `userData` no se
  elimina.

Advertencia: si el usuario deja backups dentro de `userData/backups`, pueden
perderse al desinstalar.

## 10. Entrega

Adjuntar:

- Instalador generado.
- Version.
- Fecha.
- Notas de cambios principales.
- Advertencia de backups/desinstalacion.
- Recomendacion de configurar backups fuera de `userData`.
