function clonarGeometria(geometria) {
  if (!Array.isArray(geometria)) {
    return []
  }

  return geometria.map((punto) =>
    Array.isArray(punto) ? [...punto] : punto
  )
}

function crearNombreDuplicado(intervencion = {}) {
  if (intervencion.nombre) {
    return `${intervencion.nombre} (copia)`
  }

  return `${intervencion.obra || 'Intervencion'} (copia)`
}

/**
 * Prepara una copia operativa de una intervencion.
 *
 * No arrastra campos tecnicos de sincronizacion, foco, versionado ni fechas de
 * la original. La nueva intervencion conserva los datos de trabajo: obra,
 * ubicacion, barrio, geometria, metricas, fuente y observaciones.
 */
export function crearDuplicadoIntervencion(
  intervencion = {},
  {
    id,
    ahora = new Date().toISOString(),
  } = {}
) {
  return {
    nombre: crearNombreDuplicado(intervencion),
    mesTerminacion: intervencion.mesTerminacion || '',
    obra: intervencion.obra || '',
    ubicacion: intervencion.ubicacion || '',
    barrio: intervencion.barrio || '',
    estado: 'Finalizada',
    fuente: intervencion.fuente || '',
    inspector: intervencion.inspector || '',
    realizo: intervencion.realizo || '',
    cuadras: intervencion.cuadras || '',
    metrosLineales: intervencion.metrosLineales || '',
    metrosCuadrados: intervencion.metrosCuadrados || '',
    descripcion: intervencion.descripcion || '',
    direccion: intervencion.direccion || '',
    latitud: intervencion.latitud || '',
    longitud: intervencion.longitud || '',
    geometriaTipo: intervencion.geometriaTipo || 'Punto',
    geometria: clonarGeometria(intervencion.geometria),
    periodo: intervencion.periodo || '',
    id,
    createdAt: ahora,
    updatedAt: ahora,
    deletedAt: null,
    version: 1,
  }
}
