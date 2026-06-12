const FORMATEADOR_AR = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 2,
})

export function obtenerTituloIntervencion(intervencion = {}) {
  return (
    intervencion.nombre ||
    intervencion.obra ||
    'Intervencion'
  )
}

export function obtenerReferenciaIntervencion(intervencion = {}) {
  return (
    intervencion.ubicacion ||
    intervencion.direccion ||
    ''
  )
}

export function obtenerSubtituloIntervencion(intervencion = {}) {
  const partes = []

  if (intervencion.nombre && intervencion.obra) {
    partes.push(intervencion.obra)
  }

  if (intervencion.geometriaTipo) {
    partes.push(intervencion.geometriaTipo)
  }

  return partes.join(' / ')
}

export function obtenerNumeroPositivo(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return null
  }

  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero <= 0) {
    return null
  }

  return numero
}

export function formatearNumeroIntervencion(valor) {
  return FORMATEADOR_AR.format(valor)
}

export function obtenerMetricasIntervencion(intervencion = {}) {
  const metricas = []
  const geometriaTipo =
    intervencion.geometriaTipo || 'Punto'

  if (geometriaTipo === 'Punto') {
    return metricas
  }

  const metrosLineales =
    obtenerNumeroPositivo(intervencion.metrosLineales)
  const metrosCuadrados =
    obtenerNumeroPositivo(intervencion.metrosCuadrados)
  const cuadras =
    obtenerNumeroPositivo(intervencion.cuadras)

  if (geometriaTipo === 'Linea' || geometriaTipo === 'Línea') {
    if (metrosLineales) {
      metricas.push({
        label: 'm lineales',
        value: formatearNumeroIntervencion(metrosLineales),
      })
    }

    if (cuadras) {
      metricas.push({
        label: 'cuadras',
        value: formatearNumeroIntervencion(cuadras),
      })
    }
  }

  if (geometriaTipo === 'Poligono' || geometriaTipo === 'Polígono') {
    if (metrosCuadrados) {
      metricas.push({
        label: 'm2',
        value: formatearNumeroIntervencion(metrosCuadrados),
      })
    }
  }

  return metricas
}

export function obtenerDetalleIntervencion(
  intervencion = {},
  { referencia = '', metricas = [] } = {}
) {
  const coordenadas =
    intervencion.latitud && intervencion.longitud
      ? `${intervencion.latitud}, ${intervencion.longitud}`
      : ''

  const cantidadPuntos =
    Array.isArray(intervencion.geometria)
      ? intervencion.geometria.length
      : 0
  const camposVisibles = new Set(['Tipo'])

  if (intervencion.nombre) {
    camposVisibles.add('Nombre')
  } else if (intervencion.obra) {
    camposVisibles.add('Obra')
  }

  if (intervencion.nombre && intervencion.obra) {
    camposVisibles.add('Obra')
  }

  if (intervencion.barrio) {
    camposVisibles.add('Barrio')
  }

  if (intervencion.fuente) {
    camposVisibles.add('Fuente')
  }

  if (referencia && referencia === intervencion.ubicacion) {
    camposVisibles.add('Ubicacion')
  }

  if (referencia && referencia === intervencion.direccion) {
    camposVisibles.add('Direccion')
  }

  metricas.forEach((metrica) => {
    if (metrica.label === 'cuadras') {
      camposVisibles.add('Cuadras')
    }

    if (metrica.label === 'm lineales') {
      camposVisibles.add('Metros lineales')
    }

    if (metrica.label === 'm2') {
      camposVisibles.add('Metros cuadrados')
    }
  })

  return [
    ['Nombre', intervencion.nombre],
    ['Mes', intervencion.mesTerminacion],
    ['Obra', intervencion.obra],
    ['Tipo', intervencion.geometriaTipo],
    ['Barrio', intervencion.barrio],
    ['Ubicacion', intervencion.ubicacion],
    ['Direccion', intervencion.direccion],
    ['Fuente', intervencion.fuente],
    ['Inspector', intervencion.inspector],
    ['Realizo', intervencion.realizo],
    ['Cuadras', intervencion.cuadras],
    ['Metros lineales', intervencion.metrosLineales],
    ['Metros cuadrados', intervencion.metrosCuadrados],
    ['Coordenadas', coordenadas],
    [
      'Puntos de geometria',
      cantidadPuntos ? String(cantidadPuntos) : '',
    ],
    ['Observaciones', intervencion.descripcion],
  ].filter(([label, valor]) => {
    if (camposVisibles.has(label)) return false
    if (valor === null || valor === undefined) return false

    return String(valor).trim() !== ''
  })
}

export function normalizarIntervencion(intervencion = {}) {
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
