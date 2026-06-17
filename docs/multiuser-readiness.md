# Preparacion para login y multiusuario

Este proyecto esta pensado hoy como aplicacion local con SQLite dentro de Electron.
La transicion mas ordenada a multiusuario consiste en mantener esa capa local
como cache/offline y agregar un adaptador remoto.

## Objetivo

- Dos o mas usuarios pueden ver intervenciones compartidas.
- La app sigue funcionando si la red cae.
- Los cambios se sincronizan con trazabilidad.
- La base local puede migrar sin perder backups ni historial.

## Modelo recomendado

### Tabla `intervenciones`

- `id`: UUID estable generado en cliente.
- `periodo`: `YYYY-MM`.
- `data`: JSON normalizado de la intervencion.
- `created_at`: fecha de creacion.
- `updated_at`: fecha de ultima edicion.
- `deleted_at`: baja logica opcional.
- `version`: entero incremental.
- `updated_by`: usuario que modifico.

### Tabla `historial_cambios`

- `id`: UUID.
- `intervencion_id`: referencia.
- `accion`: crear, editar, duplicar, eliminar, restaurar.
- `cambios`: JSON con diferencias.
- `created_at`: fecha del evento.
- `created_by`: usuario.

## Concurrencia

Para una primera version conviene usar control optimista:

1. El cliente descarga la intervencion con `version`.
2. Al guardar, envia `id`, `version` actual y cambios.
3. El servidor actualiza solo si la version coincide.
4. Si otro usuario guardo antes, se devuelve conflicto.
5. La app muestra comparacion y permite recargar o guardar como nueva version.

Esto evita bloqueos y es suficiente para dos usuarios operativos.

## Sincronizacion

La app ya guarda campos compatibles con sincronizacion:

- `createdAt`
- `updatedAt`
- `deletedAt`
- `version`
- `syncStatus`
- `updatedBy`

La persistencia del renderer ya esta encapsulada detras de un contrato:

- `src/repositories/intervencionesRepositoryContract.mjs` define los metodos
  obligatorios.
- `src/repositories/intervencionesRepository.js` expone una factory local
  `crearIntervencionesRepositoryLocal`.

El paso siguiente seria implementar un segundo adaptador con el mismo contrato:

- `localIntervencionesRepository`: SQLite actual.
- `remoteIntervencionesRepository`: Supabase u otro backend.

Un servicio de sincronizacion decidiria que enviar y que traer.

## Supabase como opcion gratuita

Supabase puede servir para prototipo con login, Postgres y realtime.
Para produccion municipal conviene revisar limites de plan, auditoria,
backups, privacidad, disponibilidad y titularidad de datos antes de adoptarlo.

## Riesgos a resolver antes de migrar

- Politica de conflictos cuando dos usuarios editan la misma intervencion.
- Roles: administrador, carga, consulta.
- Auditoria obligatoria por usuario.
- Backup remoto y exportacion completa.
- Plan de reversa si la red o el proveedor falla.

## Orden sugerido de implementacion

1. Mantener DTOs y validacion Electron como contrato de datos.
2. Implementar `remoteIntervencionesRepository` con el mismo contrato.
3. Agregar login sin cambiar el flujo de carga.
4. Sincronizar lectura remota en segundo plano.
5. Activar escritura remota con conflictos visibles.
6. Agregar realtime para refrescar el mapa/lista.
