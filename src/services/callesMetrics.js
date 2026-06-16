import bbox from '@turf/bbox'
import booleanIntersects from '@turf/boolean-intersects'
import {
  point,
} from '@turf/helpers'

import {
  calcularLongitudLineaMetros,
} from '@services/geometryMetrics'
import {
  formatearCuadrasOperativas,
} from '@domain/cuadras'
import { logger } from '@services/logger'
import {
  calcularCuadrasPorInterferencias,
  crearAdvertenciaLineaMulticalle,
} from '@services/streetNetwork/cuadras'
import {
  bboxIntersecta,
  crearBboxPunto,
  expandirBbox,
  geometriaAppALineString,
  obtenerExtremosCalle,
  obtenerPuntosMuestreoLinea,
} from '@services/streetNetwork/geometry'
import {
  buscarCallesPorBbox,
  cargarCallesIndexadas,
} from '@services/streetNetwork/indexacion'
import {
  buscarCallesCercanasAPunto,
  buscarCallesDeEsquina,
  buscarCallesPorNombreEnPuntos,
  buscarCandidatosPunto,
  crearBufferLinea,
  detectarCallesPorSegmento,
  detectarInterferenciasLinea,
  obtenerNombresDistintos,
  tienePuntoMedioCercano,
  unirCallesUnicas,
} from '@services/streetNetwork/deteccion'
import {
  construirUbicacionLinea,
  construirUbicacionPunto,
  obtenerCallePrincipal,
  obtenerNombreCallePrincipal,
} from '@services/streetNetwork/ubicacion'

function calcularCuadrasPorDistancia(geometria) {
  const metros =
    calcularLongitudLineaMetros(geometria)

  if (!metros) return 0

  return metros / 100
}

function obtenerCallesBase({
  calles,
  callesCandidatas,
}) {
  return callesCandidatas.length
    ? callesCandidatas
    : calles
}

function construirResultadoDesdeTramos({
  calles,
  callesCandidatas,
  linea,
  tramosPorSegmento,
  nombresPorSegmento,
}) {
  const callePrincipal =
    obtenerNombreCallePrincipal(
      tramosPorSegmento
    )
  const inicio = point(
    linea.geometry.coordinates[0]
  )
  const fin = point(
    linea.geometry.coordinates[
      linea.geometry.coordinates.length - 1
    ]
  )
  const callesBase =
    obtenerCallesBase({
      calles,
      callesCandidatas,
    })
  const puntosLinea =
    obtenerPuntosMuestreoLinea(linea)
  const tramosPorPuntos =
    buscarCallesPorNombreEnPuntos({
      calles: callesBase,
      puntos: puntosLinea,
      nombre: callePrincipal,
    })
  const tramosParaUbicacion =
    unirCallesUnicas([
      ...tramosPorSegmento,
      ...tramosPorPuntos,
    ])
  const callesInicio =
    buscarCallesCercanasAPunto({
      calles,
      puntoUsuario: inicio,
      excluirNombre: callePrincipal,
    })
  const callesFin =
    buscarCallesCercanasAPunto({
      calles,
      puntoUsuario: fin,
      excluirNombre: callePrincipal,
    })
  const ubicacion =
    construirUbicacionLinea({
      callePrincipal,
      tramosDetectados:
        tramosParaUbicacion,
      callesInicio,
      callesFin,
    })
  const callesDetectadas =
    obtenerNombresDistintos(
      tramosParaUbicacion
    )
  const interferencias =
    detectarInterferenciasLinea({
      calles: callesBase,
      linea,
      callePrincipal,
    })

  return {
    cuadras:
      calcularCuadrasPorInterferencias({
        interferencias,
        fallback:
          tramosPorSegmento.length,
      }),
    metodo: 'red-vial',
    tramos: tramosPorSegmento.length,
    ubicacion,
    calles: callesDetectadas.slice(0, 5),
    interferencias,
    advertencia:
      crearAdvertenciaLineaMulticalle(
        nombresPorSegmento
      ),
  }
}

function detectarTramosPorInterseccion({
  callesCandidatas,
  bboxBusqueda,
  linea,
}) {
  const bufferLinea = crearBufferLinea(linea)

  return callesCandidatas.filter((calle) => {
    if (
      !bboxIntersecta(
        bboxBusqueda,
        calle.bbox
      )
    ) {
      return false
    }

    return booleanIntersects(
      bufferLinea,
      calle.feature
    ) &&
      tienePuntoMedioCercano(
        calle.feature,
        linea
      )
  })
}

function construirResultadoDesdeInterseccion({
  calles,
  callesCandidatas,
  linea,
  tramosDetectados,
}) {
  const callePrincipal =
    obtenerCallePrincipal(
      tramosDetectados
    )
  const inicio = point(
    linea.geometry.coordinates[0]
  )
  const fin = point(
    linea.geometry.coordinates[
      linea.geometry.coordinates.length - 1
    ]
  )
  const callesInicio =
    buscarCallesCercanasAPunto({
      calles,
      puntoUsuario: inicio,
      excluirNombre: callePrincipal,
    })
  const callesFin =
    buscarCallesCercanasAPunto({
      calles,
      puntoUsuario: fin,
      excluirNombre: callePrincipal,
    })
  const ubicacion =
    construirUbicacionLinea({
      callePrincipal,
      tramosDetectados,
      callesInicio,
      callesFin,
    })
  const callesDetectadas =
    obtenerNombresDistintos(
      tramosDetectados
    )

  return {
    cuadras:
      calcularCuadrasPorInterferencias({
        interferencias:
          detectarInterferenciasLinea({
            calles: callesCandidatas,
            linea,
            callePrincipal,
          }),
        fallback:
          tramosDetectados.length,
      }),
    metodo: 'red-vial',
    tramos: tramosDetectados.length,
    ubicacion,
    calles: callesDetectadas.slice(0, 5),
    advertencia: null,
  }
}

export async function calcularCuadrasLinea(
  geometria
) {
  if (
    !Array.isArray(geometria) ||
    geometria.length < 2
  ) {
    return {
      cuadras: '',
      metodo: 'sin-geometria',
      tramos: 0,
    }
  }

  const linea = geometriaAppALineString(
    geometria
  )
  const bboxBusqueda = expandirBbox(
    bbox(linea),
    0.00055
  )

  try {
    const calles =
      await cargarCallesIndexadas()
    const callesCandidatas =
      buscarCallesPorBbox(bboxBusqueda)
    const callesBase =
      obtenerCallesBase({
        calles,
        callesCandidatas,
      })
    const tramosPorSegmento =
      detectarCallesPorSegmento({
        linea,
        calles: callesBase,
      })
    const nombresPorSegmento =
      obtenerNombresDistintos(
        tramosPorSegmento
      )

    if (tramosPorSegmento.length > 0) {
      return construirResultadoDesdeTramos({
        calles,
        callesCandidatas,
        linea,
        tramosPorSegmento,
        nombresPorSegmento,
      })
    }

    const tramosDetectados =
      detectarTramosPorInterseccion({
        callesCandidatas,
        bboxBusqueda,
        linea,
      })

    if (tramosDetectados.length > 0) {
      return construirResultadoDesdeInterseccion({
        calles,
        callesCandidatas,
        linea,
        tramosDetectados,
      })
    }
  } catch (error) {
    logger.warn(
      'Fallback de cuadras por distancia:',
      error
    )
  }

  const cuadrasEstimadas =
    calcularCuadrasPorDistancia(geometria)

  return {
    cuadras: formatearCuadrasOperativas(
      cuadrasEstimadas
    ),
    metodo: 'distancia-100m',
    tramos: 0,
  }
}

export async function sugerirUbicacionPunto(
  lat,
  lon
) {
  const latNum = Number(lat)
  const lonNum = Number(lon)

  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lonNum)
  ) {
    return null
  }

  const puntoUsuario = point([
    lonNum,
    latNum,
  ])

  try {
    const calles =
      await cargarCallesIndexadas()
    const callesCandidatas =
      calles.length
        ? buscarCallesPorBbox(
          crearBboxPunto(lonNum, latNum)
        )
        : calles
    const candidatos =
      buscarCandidatosPunto({
        calles: callesCandidatas,
        puntoUsuario,
      })
    const calle = candidatos[0]

    if (!calle) return null

    const [extremoA, extremoB] =
      obtenerExtremosCalle(calle.feature)
    const callesExtremoA = extremoA
      ? buscarCallesDeEsquina({
        calles,
        puntoExtremo: extremoA,
        calleBase: calle,
      })
      : []
    const callesExtremoB = extremoB
      ? buscarCallesDeEsquina({
        calles,
        puntoExtremo: extremoB,
        calleBase: calle,
      })
      : []
    const ubicacion =
      construirUbicacionPunto({
        calle,
        callesExtremoA,
        callesExtremoB,
      })

    if (!ubicacion) return null

    return {
      ubicacion,
      calle: calle.nombre,
      distanciaMetros:
        calle.distancia * 1000,
    }
  } catch (error) {
    logger.warn(
      'No se pudo sugerir ubicacion del punto:',
      error
    )

    return null
  }
}
