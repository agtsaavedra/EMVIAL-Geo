function mensajeExportacion(
  formato,
  resultado
) {
  if (!resultado.ok) {
    return `No hay intervenciones con geometria valida para exportar en ${formato}.`
  }

  if (resultado.omitidas > 0) {
    return `${formato} exportado: ${resultado.exportadas} intervenciones. Omitidas sin geometria valida: ${resultado.omitidas}.`
  }

  return `${formato} exportado correctamente.`
}

function contarPorGeometria(intervenciones = []) {
  return intervenciones.reduce(
    (acumulado, intervencion) => {
      const tipo =
        intervencion.geometriaTipo || 'Sin geometria'

      acumulado[tipo] =
        (acumulado[tipo] || 0) + 1

      return acumulado
    },
    {}
  )
}

function formatearConteoGeometrias(conteo) {
  return Object.entries(conteo)
    .map(([tipo, total]) => `${tipo}: ${total}`)
    .join(' | ')
}

function primerasIntervencionesPreview(
  intervenciones = []
) {
  return intervenciones
    .slice(0, 5)
    .map((intervencion, index) => {
      const nombre =
        intervencion.nombre ||
        intervencion.obra ||
        'Sin nombre'

      const barrio =
        intervencion.barrio || 'Sin barrio'

      return `${index + 1}. ${nombre} - ${barrio}`
    })
    .join('\n')
}

function detalleImportacionGIS({
  periodoActivo,
  resultado,
}) {
  const geometrias =
    formatearConteoGeometrias(
      contarPorGeometria(
        resultado.intervenciones
      )
    )

  const primeras =
    primerasIntervencionesPreview(
      resultado.intervenciones
    )

  return [
    `Periodo destino: ${periodoActivo}`,
    `Registros leidos: ${resultado.total}`,
    `Importables: ${resultado.importables}`,
    `Omitidos: ${resultado.omitidas}`,
    geometrias
      ? `Geometrias: ${geometrias}`
      : '',
    primeras
      ? `Primeras intervenciones:\n${primeras}`
      : '',
    'Antes de importar se creara un backup preventivo.',
  ]
    .filter(Boolean)
    .join('\n\n')
}

module.exports = {
  mensajeExportacion,
  contarPorGeometria,
  formatearConteoGeometrias,
  primerasIntervencionesPreview,
  detalleImportacionGIS,
}
