import bbox from '@turf/bbox'
import booleanIntersects from '@turf/boolean-intersects'
import buffer from '@turf/buffer'
import distance from '@turf/distance'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import {
  lineString,
} from '@turf/helpers'

import {
  bboxIntersecta,
  expandirBbox,
  obtenerExtremosCalle,
  obtenerLineStrings,
  obtenerPuntoMedioSegmento,
  puntoMedioLinea,
} from '@services/streetNetwork/geometry'

const DISTANCIA_BUFFER_KM = 0.018
const DISTANCIA_PUNTO_MEDIO_KM = 0.024
const DISTANCIA_CALLE_CERCANA_KM = 0.045
const DISTANCIA_ESQUINA_KM = 0.055

export function calcularDistanciaPuntoACalle(
  puntoUsuario,
  calle
) {
  const distancias =
    obtenerLineStrings(calle.feature).map(
      (coordinates) => {
        const cercano =
          nearestPointOnLine(
            lineString(coordinates),
            puntoUsuario,
            {
              units: 'kilometers',
            }
          )

        return Number(
          cercano.properties?.dist
        )
      }
    )

  return Math.min(...distancias)
}

export function detectarCalleSegmento({
  segmento,
  calles,
}) {
  const bboxSegmento =
    expandirBbox(bbox(segmento), 0.00035)
  const coordenadas =
    segmento.geometry.coordinates
  const puntoMedio =
    obtenerPuntoMedioSegmento(
      coordenadas[0],
      coordenadas[1]
    )

  return calles
    .filter((calle) =>
      bboxIntersecta(
        bboxSegmento,
        calle.bbox
      )
    )
    .map((calle) => ({
      ...calle,
      distancia:
        calcularDistanciaPuntoACalle(
          puntoMedio,
          calle
        ),
    }))
    .filter(
      (calle) =>
        calle.nombre &&
        calle.nombre !== 'Sin nombre' &&
        Number.isFinite(calle.distancia) &&
        calle.distancia <=
          DISTANCIA_CALLE_CERCANA_KM
    )
    .sort(
      (a, b) => a.distancia - b.distancia
    )[0]
}

export function buscarCallePorNombreCercanaAPunto({
  calles,
  puntoUsuario,
  nombre,
}) {
  return calles
    .filter(
      (calle) =>
        calle.nombre === nombre &&
        calle.nombre !== 'Sin nombre'
    )
    .map((calle) => ({
      ...calle,
      distancia:
        calcularDistanciaPuntoACalle(
          puntoUsuario,
          calle
        ),
    }))
    .filter(
      (calle) =>
        Number.isFinite(calle.distancia) &&
        calle.distancia <=
          DISTANCIA_CALLE_CERCANA_KM
    )
    .sort(
      (a, b) => a.distancia - b.distancia
    )[0]
}

export function unirCallesUnicas(calles = []) {
  const porId = new Map()

  calles.filter(Boolean).forEach((calle) => {
    porId.set(calle.id, calle)
  })

  return [...porId.values()]
}

export function buscarCallesPorNombreEnPuntos({
  calles,
  puntos,
  nombre,
}) {
  return puntos
    .map((puntoUsuario) =>
      buscarCallePorNombreCercanaAPunto({
        calles,
        puntoUsuario,
        nombre,
      })
    )
    .filter(Boolean)
}

export function detectarCallesPorSegmento({
  linea,
  calles,
}) {
  const coordenadas =
    linea.geometry.coordinates

  if (coordenadas.length < 2) {
    return []
  }

  return coordenadas
    .slice(1)
    .map((coordenada, index) =>
      lineString([
        coordenadas[index],
        coordenada,
      ])
    )
    .map((segmento) =>
      detectarCalleSegmento({
        segmento,
        calles,
      })
    )
    .filter(Boolean)
}

export function obtenerNombresDistintos(calles = []) {
  return [
    ...new Set(
      calles
        .map((calle) => calle.nombre)
        .filter(
          (nombre) =>
            nombre && nombre !== 'Sin nombre'
        )
    ),
  ]
}

export function detectarInterferenciasLinea({
  calles,
  linea,
  callePrincipal,
}) {
  const bufferLinea = buffer(
    linea,
    DISTANCIA_BUFFER_KM,
    {
      units: 'kilometers',
    }
  )

  return [
    ...new Set(
      calles
        .filter((calle) => {
          if (
            !calle.nombre ||
            calle.nombre === 'Sin nombre' ||
            calle.nombre === callePrincipal
          ) {
            return false
          }

          return booleanIntersects(
            bufferLinea,
            calle.feature
          )
        })
        .map((calle) => calle.nombre)
    ),
  ]
}

export function buscarCallesCercanasAPunto({
  calles,
  puntoUsuario,
  excluirNombre,
}) {
  return calles
    .map((calle) => ({
      nombre: calle.nombre,
      distancia:
        calcularDistanciaPuntoACalle(
          puntoUsuario,
          calle
        ),
    }))
    .filter(
      (calle) =>
        calle.nombre &&
        calle.nombre !== 'Sin nombre' &&
        calle.nombre !== excluirNombre &&
        Number.isFinite(calle.distancia) &&
        calle.distancia <=
          DISTANCIA_ESQUINA_KM
    )
    .sort(
      (a, b) => a.distancia - b.distancia
    )
    .map((calle) => calle.nombre)
}

export function buscarCallesDeEsquina({
  calles,
  puntoExtremo,
  calleBase,
}) {
  return calles
    .filter((calle) => {
      if (calle.id === calleBase.id) {
        return false
      }

      if (
        calle.nombre === 'Sin nombre' ||
        calle.nombre === calleBase.nombre
      ) {
        return false
      }

      return obtenerExtremosCalle(
        calle.feature
      ).some((extremo) => (
        distance(puntoExtremo, extremo, {
          units: 'kilometers',
        }) <= DISTANCIA_ESQUINA_KM
      ))
    })
    .map((calle) => calle.nombre)
}

export function tienePuntoMedioCercano(
  calleFeature,
  lineaUsuario
) {
  return obtenerLineStrings(calleFeature).some(
    (coordinates) => {
      const medio =
        puntoMedioLinea(coordinates)

      if (!medio) return false

      const cercano =
        nearestPointOnLine(
          lineaUsuario,
          medio,
          {
            units: 'kilometers',
          }
        )

      return (
        Number(cercano.properties?.dist) <=
        DISTANCIA_PUNTO_MEDIO_KM
      )
    }
  )
}

export function crearBufferLinea(linea) {
  return buffer(
    linea,
    DISTANCIA_BUFFER_KM,
    {
      units: 'kilometers',
    }
  )
}

export function buscarCandidatosPunto({
  calles,
  puntoUsuario,
}) {
  return calles
    .map((calle) => ({
      ...calle,
      distancia:
        calcularDistanciaPuntoACalle(
          puntoUsuario,
          calle
        ),
    }))
    .filter(
      (calle) =>
        calle.nombre !== 'Sin nombre' &&
        Number.isFinite(calle.distancia) &&
        calle.distancia <=
          DISTANCIA_CALLE_CERCANA_KM
    )
    .sort(
      (a, b) => a.distancia - b.distancia
    )
}
