import along from '@turf/along'
import length from '@turf/length'
import {
  point,
  lineString,
} from '@turf/helpers'

export function expandirBbox(bbox, margen = 0.00022) {
  return [
    bbox[0] - margen,
    bbox[1] - margen,
    bbox[2] + margen,
    bbox[3] + margen,
  ]
}

export function bboxIntersecta(a, b) {
  return !(
    a[2] < b[0] ||
    a[0] > b[2] ||
    a[3] < b[1] ||
    a[1] > b[3]
  )
}

export function crearBboxPunto(lon, lat, margen = 0.0012) {
  return [
    lon - margen,
    lat - margen,
    lon + margen,
    lat + margen,
  ]
}

export function geometriaAppALineString(geometria) {
  return lineString(
    geometria.map(([lat, lng]) => [
      Number(lng),
      Number(lat),
    ])
  )
}

export function obtenerLineStrings(feature) {
  if (feature.geometry?.type === 'LineString') {
    return [feature.geometry.coordinates]
  }

  if (
    feature.geometry?.type ===
    'MultiLineString'
  ) {
    return feature.geometry.coordinates
  }

  return []
}

export function puntoMedioLinea(coordinates) {
  const line = lineString(coordinates)
  const longitud = length(line, {
    units: 'kilometers',
  })

  if (!longitud) return null

  return along(line, longitud / 2, {
    units: 'kilometers',
  })
}

export function obtenerExtremosCalle(feature) {
  const coordinates =
    obtenerLineStrings(feature)[0] || []

  if (coordinates.length < 2) {
    return []
  }

  return [
    point(coordinates[0]),
    point(coordinates[coordinates.length - 1]),
  ]
}

export function obtenerPuntoMedioSegmento(
  coordenadaA,
  coordenadaB
) {
  return point([
    (coordenadaA[0] + coordenadaB[0]) / 2,
    (coordenadaA[1] + coordenadaB[1]) / 2,
  ])
}

export function obtenerPuntosMuestreoLinea(linea) {
  const longitud = length(linea, {
    units: 'kilometers',
  })

  if (!longitud) {
    return []
  }

  const intervaloKm = 0.08
  const puntos = [
    point(linea.geometry.coordinates[0]),
  ]

  for (
    let distanciaKm = intervaloKm;
    distanciaKm < longitud;
    distanciaKm += intervaloKm
  ) {
    puntos.push(
      along(linea, distanciaKm, {
        units: 'kilometers',
      })
    )
  }

  puntos.push(
    point(
      linea.geometry.coordinates[
        linea.geometry.coordinates.length - 1
      ]
    )
  )

  return puntos
}
