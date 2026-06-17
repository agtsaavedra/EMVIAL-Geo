# Contrato de intervencion

Este documento define el modelo operativo de una intervencion en EMVIAL Geo.
Sirve como contrato entre formulario, base local, importaciones, exportaciones,
validacion Electron y una futura sincronizacion remota.

## Principios

- Toda intervencion pertenece a un periodo.
- El estado operativo actual siempre es `Finalizada`.
- La geometria define que metricas son relevantes.
- Los campos internos no deben aparecer en exportaciones administrativas o GIS.
- El renderer puede sugerir datos, pero Electron valida antes de persistir.
- Los ids deben ser estables para permitir historial y sincronizacion.

## Tipos de geometria

Valores canonicos:

- `Punto`
- `Línea`
- `Polígono`

Entradas externas aceptables:

- `Linea` -> `Línea`
- `Poligono` -> `Polígono`
- variantes con o sin tilde en importaciones/exportaciones.

## Campos principales

| Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- |
| `id` | string | Si al persistir | UUID o id estable de la intervencion. |
| `periodo` | string | Si | Periodo `YYYY-MM`. |
| `nombre` | string | No | Nombre operativo o referencia corta. |
| `mesTerminacion` | string | No | Mes de terminacion informado por el usuario. |
| `obra` | string | Si | Tipo de obra/intervencion. |
| `ubicacion` | string | No | Ubicacion descriptiva principal. |
| `barrio` | string | No | Barrio o zona. |
| `estado` | string | Si | Siempre `Finalizada`. |
| `fuente` | string | No | Origen del dato: carga manual, PDF, GIS, etc. |
| `inspector` | string | No | Inspector asociado. |
| `realizo` | string | No | Equipo, cooperativa o responsable. |
| `descripcion` | string | No | Observaciones. |
| `direccion` | string | No | Texto usado para busqueda geografica. |
| `latitud` | string/number | Segun geometria | Latitud del punto principal. |
| `longitud` | string/number | Segun geometria | Longitud del punto principal. |
| `geometriaTipo` | string | Si | `Punto`, `Línea` o `Polígono`. |
| `geometria` | array | Segun geometria | Lista de puntos `[lat, lon]`. |
| `cuadras` | string/number | No | Cuadras estimadas para lineas. |
| `metrosLineales` | string/number | No | Longitud para lineas. |
| `metrosCuadrados` | string/number | No | Area para poligonos. |

## Campos internos

| Campo | Tipo | Uso |
| --- | --- | --- |
| `createdAt` | ISO string | Fecha de creacion local. |
| `updatedAt` | ISO string | Fecha de ultima modificacion local. |
| `deletedAt` | ISO string/null | Baja logica futura o restauraciones. |
| `version` | number | Control optimista y sincronizacion futura. |
| `syncStatus` | string | Estado de sincronizacion futura. |
| `updatedBy` | string/null | Usuario futuro que edito. |

Estos campos no deben exponerse en Excel, GIS o PDF salvo que se solicite un
reporte tecnico.

## Metadata no persistible

Algunos campos pueden viajar desde renderer hacia Electron para indicar una
operacion, pero no deben quedar guardados dentro de la intervencion:

| Campo | Uso |
| --- | --- |
| `__historialAccion` | Permite registrar una accion especial, por ejemplo `duplicar`. |
| `__historialOrigenId` | Indica la intervencion origen de un duplicado. |
| `__focusKey` | Uso de UI para foco/listado. No debe persistir. |

Electron debe separar esta metadata antes de guardar.

## Reglas por geometria

### Punto

Debe tener una posicion.

Se acepta:

- `latitud` y `longitud`;
- o `geometria` con al menos un punto.

Metricas visibles:

- no se muestran `cuadras`;
- no se muestran `metrosLineales`;
- no se muestran `metrosCuadrados`.

### Linea

Debe tener al menos 2 puntos en `geometria`.

Metricas esperadas:

- `metrosLineales`;
- `cuadras`;
- ubicacion calculada por calle/altura/intersecciones cuando la red vial lo
  permite.

La linea idealmente representa una sola calle. Si dobla hacia otra calle, la app
debe advertir que corresponde cargar otra intervencion.

### Poligono

Debe tener al menos 3 puntos en `geometria`.

Metricas esperadas:

- `metrosCuadrados`.

## Validacion Electron

`electron/validation.js` es la ultima compuerta antes de persistir.

Debe:

- normalizar estado a `Finalizada`;
- normalizar tipo de geometria;
- validar periodo;
- validar coordenadas;
- validar cantidad minima de puntos;
- limitar longitud de campos;
- rechazar archivos estaticos no permitidos;
- quitar campos desconocidos o internos no autorizados.

## Exportaciones

Las exportaciones deben pasar por DTOs.

No deben exportarse:

- `syncStatus`;
- `updatedBy`;
- `version`;
- `deletedAt`;
- `__focusKey`;
- metadata temporal;
- detalles internos de UI.

## Importaciones

Las importaciones GIS deben convertir geometria externa a este contrato:

- `Point` -> `Punto`;
- `LineString` -> `Línea`;
- `Polygon` -> `Polígono`.

El importador puede aceptar alias de campos, pero la salida debe ser una
intervencion normalizada.

## Historial

Acciones admitidas:

- `crear`;
- `editar`;
- `duplicar`;
- `eliminar`;
- `restaurar`.

El historial registra diferencias entre estado anterior y actual. Los campos
tecnicos se filtran al mostrar el detalle al usuario.

## Sincronizacion futura

Para Supabase u otro backend remoto, el contrato recomendado es:

- `id` UUID estable;
- `periodo` indexado;
- `data` JSON normalizado;
- `created_at`;
- `updated_at`;
- `deleted_at`;
- `version`;
- `updated_by`.

La concurrencia deberia manejarse con control optimista:

1. leer intervencion con `version`;
2. guardar solo si la version remota coincide;
3. si no coincide, mostrar conflicto;
4. permitir recargar, comparar o guardar una nueva version.

## Criterios de compatibilidad

Un cambio de modelo es compatible si:

- no rompe importaciones previas;
- no rompe exportaciones existentes;
- Electron puede normalizar registros antiguos;
- los tests de DTO, dominio y validacion siguen pasando.

Si un cambio no cumple esto, requiere migracion explicita.
