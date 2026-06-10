/**
 * Analisis de calidad de datos para intervenciones.
 *
 * Agrupa controles operativos antes de exportar, informar o entregar datos.
 */

const MAR_DEL_PLATA_BOUNDS = {
  minLat: -38.25,
  maxLat: -37.75,
  minLng: -58.2,
  maxLng: -57.35,
}

function estaVacio(valor) {
  return (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ''
  )
}

function numeroValido(valor) {
  return Number.isFinite(Number(valor))
}

function coordenadaFueraDeZona(intervencion) {
  if (
    estaVacio(intervencion.latitud) ||
    estaVacio(intervencion.longitud)
  ) {
    return false
  }

  const lat = Number(intervencion.latitud)
  const lng = Number(intervencion.longitud)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return true
  }

  return (
    lat < MAR_DEL_PLATA_BOUNDS.minLat ||
    lat > MAR_DEL_PLATA_BOUNDS.maxLat ||
    lng < MAR_DEL_PLATA_BOUNDS.minLng ||
    lng > MAR_DEL_PLATA_BOUNDS.maxLng
  )
}

function nombreIntervencion(intervencion, index) {
  return (
    intervencion.nombre ||
    intervencion.ubicacion ||
    intervencion.direccion ||
    `${intervencion.obra || 'Intervencion'} #${index + 1}`
  )
}

function crearIssue(
  tipo,
  severidad,
  mensaje,
  intervencion,
  index
) {
  return {
    tipo,
    severidad,
    mensaje,
    id: intervencion.id,
    nombre: nombreIntervencion(intervencion, index),
    obra: intervencion.obra || '',
    barrio: intervencion.barrio || '',
  }
}

function evaluarIntervencion(intervencion, index) {
  const issues = []
  const cantidadPuntos =
    intervencion.geometria?.length || 0

  if (
    intervencion.geometriaTipo === 'Punto' &&
    (estaVacio(intervencion.latitud) ||
      estaVacio(intervencion.longitud))
  ) {
    issues.push(
      crearIssue(
        'Sin geometria',
        'alta',
        'Punto sin latitud/longitud.',
        intervencion,
        index
      )
    )
  }

  if (
    intervencion.geometriaTipo === 'Línea' &&
    cantidadPuntos < 2
  ) {
    issues.push(
      crearIssue(
        'Linea incompleta',
        'alta',
        'Linea con menos de 2 puntos.',
        intervencion,
        index
      )
    )
  }

  if (
    intervencion.geometriaTipo === 'Polígono' &&
    cantidadPuntos < 3
  ) {
    issues.push(
      crearIssue(
        'Poligono incompleto',
        'alta',
        'Poligono con menos de 3 puntos.',
        intervencion,
        index
      )
    )
  }

  if (estaVacio(intervencion.barrio)) {
    issues.push(
      crearIssue(
        'Sin barrio',
        'media',
        'No tiene barrio o zona cargada.',
        intervencion,
        index
      )
    )
  }

  if (
    estaVacio(intervencion.ubicacion) &&
    estaVacio(intervencion.direccion)
  ) {
    issues.push(
      crearIssue(
        'Sin ubicacion',
        'media',
        'No tiene ubicacion ni direccion.',
        intervencion,
        index
      )
    )
  }

  if (
    !estaVacio(intervencion.latitud) &&
    !numeroValido(intervencion.latitud)
  ) {
    issues.push(
      crearIssue(
        'Coordenada invalida',
        'alta',
        'Latitud no numerica.',
        intervencion,
        index
      )
    )
  }

  if (
    !estaVacio(intervencion.longitud) &&
    !numeroValido(intervencion.longitud)
  ) {
    issues.push(
      crearIssue(
        'Coordenada invalida',
        'alta',
        'Longitud no numerica.',
        intervencion,
        index
      )
    )
  }

  if (coordenadaFueraDeZona(intervencion)) {
    issues.push(
      crearIssue(
        'Fuera de zona',
        'media',
        'La coordenada queda fuera del rango esperado para Mar del Plata.',
        intervencion,
        index
      )
    )
  }

  if (
    intervencion.geometriaTipo === 'Línea' &&
    estaVacio(intervencion.metrosLineales)
  ) {
    issues.push(
      crearIssue(
        'Sin metrica',
        'baja',
        'Linea sin metros lineales.',
        intervencion,
        index
      )
    )
  }

  if (
    intervencion.geometriaTipo === 'Polígono' &&
    estaVacio(intervencion.metrosCuadrados)
  ) {
    issues.push(
      crearIssue(
        'Sin metrica',
        'baja',
        'Poligono sin metros cuadrados.',
        intervencion,
        index
      )
    )
  }

  return issues
}

function agruparPorTipo(issues) {
  return issues.reduce((acumulado, issue) => {
    const existente =
      acumulado.find(
        (item) => item.tipo === issue.tipo
      )

    if (existente) {
      existente.total += 1
      return acumulado
    }

    acumulado.push({
      tipo: issue.tipo,
      severidad: issue.severidad,
      total: 1,
    })

    return acumulado
  }, [])
}

export function analizarCalidadIntervenciones(
  intervenciones = []
) {
  const issues =
    intervenciones.flatMap(
      (intervencion, index) =>
        evaluarIntervencion(
          intervencion,
          index
        )
    )

  const altas =
    issues.filter(
      (issue) => issue.severidad === 'alta'
    ).length

  const medias =
    issues.filter(
      (issue) => issue.severidad === 'media'
    ).length

  const bajas =
    issues.filter(
      (issue) => issue.severidad === 'baja'
    ).length

  return {
    totalIntervenciones:
      intervenciones.length,
    totalIssues: issues.length,
    altas,
    medias,
    bajas,
    porTipo:
      agruparPorTipo(issues),
    issues,
  }
}
