const ARCHIVOS_DATOS_PERMITIDOS = new Set([
  'barrios.geojson',
  'calles-mar-del-plata.geojson',
])

function validarPeriodo(periodo) {
  if (!periodo) return ''

  if (!/^\d{4}-\d{2}$/.test(String(periodo))) {
    throw new Error('Periodo invalido.')
  }

  return String(periodo)
}

function validarId(id) {
  if (
    id === null ||
    id === undefined ||
    String(id).trim() === ''
  ) {
    throw new Error('Id invalido.')
  }

  return String(id)
}

function validarArchivoDatos(nombreArchivo) {
  if (
    !ARCHIVOS_DATOS_PERMITIDOS.has(
      nombreArchivo
    )
  ) {
    throw new Error(
      'Archivo de datos no permitido.'
    )
  }

  return nombreArchivo
}

function validarIntervencion(intervencion) {
  if (
    !intervencion ||
    typeof intervencion !== 'object' ||
    Array.isArray(intervencion)
  ) {
    throw new Error('Intervencion invalida.')
  }

  return {
    ...intervencion,
    estado: 'Finalizada',
    geometriaTipo:
      intervencion.geometriaTipo || 'Punto',
    geometria: Array.isArray(intervencion.geometria)
      ? intervencion.geometria
      : [],
  }
}

function validarIntervencionesMasivo(intervenciones) {
  if (!Array.isArray(intervenciones)) {
    throw new Error('Lista de intervenciones invalida.')
  }

  return intervenciones.map(validarIntervencion)
}

module.exports = {
  validarPeriodo,
  validarId,
  validarArchivoDatos,
  validarIntervencion,
  validarIntervencionesMasivo,
}
