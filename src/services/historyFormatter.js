const ETIQUETAS = {
  nombre: 'Nombre',
  mesTerminacion: 'Mes de terminacion',
  obra: 'Obra',
  ubicacion: 'Ubicacion',
  barrio: 'Barrio',
  fuente: 'Fuente',
  inspector: 'Inspector',
  realizo: 'Realizo',
  cuadras: 'Cuadras',
  metrosLineales: 'Metros lineales',
  metrosCuadrados: 'Metros cuadrados',
  descripcion: 'Observaciones',
  direccion: 'Busqueda geografica',
  latitud: 'Latitud',
  longitud: 'Longitud',
  geometriaTipo: 'Tipo de geometria',
  geometria: 'Geometria',
  periodo: 'Periodo',
}

const CAMPOS_IGNORADOS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'version',
  'syncStatus',
  'updatedBy',
  '__focusKey',
])

const ACCIONES = {
  crear: 'Se creo la intervencion.',
  duplicar: 'Se duplico la intervencion.',
  editar: 'Se edito la intervencion.',
  eliminar: 'Se elimino la intervencion.',
  restaurar: 'Se restauro la intervencion.',
}

function plural(cantidad, singular, pluralTexto = `${singular}s`) {
  return cantidad === 1 ? singular : pluralTexto
}

export function formatearFechaHistorial(fecha) {
  if (!fecha) return 'Sin fecha'

  const fechaValida = new Date(fecha)

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Sin fecha'
  }

  return fechaValida.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatearValorHistorial(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Sin dato'
  }

  if (Array.isArray(valor)) {
    return `${valor.length} ${plural(valor.length, 'punto')}`
  }

  if (typeof valor === 'object') {
    return JSON.stringify(valor)
  }

  return String(valor)
}

function normalizarCambios(cambios) {
  if (!cambios || Array.isArray(cambios)) {
    return {}
  }

  if (typeof cambios === 'string') {
    try {
      return JSON.parse(cambios)
    } catch {
      return {}
    }
  }

  return cambios
}

export function obtenerCambiosHistorial(evento = {}) {
  const cambios = normalizarCambios(evento.cambios)

  return Object.entries(cambios)
    .filter(([campo]) => !CAMPOS_IGNORADOS.has(campo))
    .map(([campo, valores]) => ({
      campo,
      etiqueta: ETIQUETAS[campo] || campo,
      anterior: formatearValorHistorial(valores?.anterior),
      actual: formatearValorHistorial(valores?.actual),
    }))
}

function describirCambio(cambio) {
  if (cambio.campo === 'geometria') {
    return `Se actualizo la geometria (${cambio.anterior} -> ${cambio.actual}).`
  }

  return `${cambio.etiqueta}: ${cambio.anterior} -> ${cambio.actual}.`
}

export function describirEventoHistorial(evento = {}) {
  const cambios = obtenerCambiosHistorial(evento)

  if (evento.accion === 'crear') {
    return 'Se creo la intervencion.'
  }

  if (evento.accion === 'duplicar') {
    return 'Se creo una copia independiente de otra intervencion.'
  }

  if (evento.accion === 'eliminar') {
    return 'Se elimino la intervencion.'
  }

  if (evento.accion === 'restaurar') {
    return 'Se restauro la intervencion.'
  }

  if (!cambios.length) {
    return 'Se guardo la intervencion sin cambios relevantes.'
  }

  if (cambios.length === 1) {
    return describirCambio(cambios[0])
  }

  const campos = cambios
    .slice(0, 3)
    .map((cambio) => cambio.etiqueta)
    .join(', ')

  const restantes = cambios.length - 3
  const extra =
    restantes > 0
      ? ` y ${restantes} ${plural(restantes, 'campo')} mas`
      : ''

  return `Se actualizaron ${campos}${extra}.`
}

export function obtenerTituloAccionHistorial(evento = {}) {
  return ACCIONES[evento.accion] || 'Movimiento registrado.'
}
