function crearIdHistorial() {
  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function obtenerCambiosIntervencion(
  anterior,
  actual
) {
  if (!anterior) return actual

  const cambios = {}
  const claves = new Set([
    ...Object.keys(anterior || {}),
    ...Object.keys(actual || {}),
  ])

  claves.forEach((clave) => {
    const valorAnterior = anterior?.[clave]
    const valorActual = actual?.[clave]

    if (
      JSON.stringify(valorAnterior) !==
      JSON.stringify(valorActual)
    ) {
      cambios[clave] = {
        anterior: valorAnterior ?? null,
        actual: valorActual ?? null,
      }
    }
  })

  return cambios
}

function separarMetadataPersistencia(intervencion) {
  const {
    __historialAccion,
    __historialOrigenId,
    ...datosPersistibles
  } = intervencion

  return {
    datosPersistibles,
    metadata: {
      historialAccion: __historialAccion,
      historialOrigenId: __historialOrigenId,
    },
  }
}

module.exports = {
  crearIdHistorial,
  obtenerCambiosIntervencion,
  separarMetadataPersistencia,
}
