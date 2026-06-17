const METODOS_REPOSITORIO_INTERVENCIONES = [
  'obtenerTodas',
  'guardar',
  'guardarMasivo',
  'eliminar',
  'obtenerHistorial',
]

function validarIntervencionesRepository(repository) {
  if (!repository || typeof repository !== 'object') {
    throw new Error(
      'El repositorio de intervenciones debe ser un objeto.'
    )
  }

  const faltantes =
    METODOS_REPOSITORIO_INTERVENCIONES.filter(
      (metodo) =>
        typeof repository[metodo] !== 'function'
    )

  if (faltantes.length) {
    throw new Error(
      `Repositorio de intervenciones incompleto: ${faltantes.join(', ')}.`
    )
  }

  return repository
}

module.exports = {
  METODOS_REPOSITORIO_INTERVENCIONES,
  validarIntervencionesRepository,
}
