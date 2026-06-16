/**
 * Conversores GIS para intervenciones.
 *
 * La app guarda coordenadas como [lat, lng] porque Leaflet consume ese orden.
 * GeoJSON, SHP y la mayoria de herramientas GIS esperan [lng, lat].
 */

import {
  crearPropiedadesGeoJSON,
  crearPropiedadesShp,
  normalizarTipoGeometria,
} from '@services/exportIntervencionDTO'

function esNumeroValido(valor) {
  return Number.isFinite(Number(valor))
}

function puntoLatLngAGeoJSON(punto) {
  if (!Array.isArray(punto) || punto.length < 2) {
    return null
  }

  const lat = Number(punto[0])
  const lng = Number(punto[1])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return [lng, lat]
}

function cerrarAnillo(coordenadas) {
  if (!coordenadas.length) return coordenadas

  const primera = coordenadas[0]
  const ultima = coordenadas[coordenadas.length - 1]

  if (
    primera[0] === ultima[0] &&
    primera[1] === ultima[1]
  ) {
    return coordenadas
  }

  return [...coordenadas, primera]
}

function geometriaLinealValida(geometria, minimoPuntos) {
  return (
    Array.isArray(geometria) &&
    geometria.length >= minimoPuntos
  )
}

function crearGeometriaGeoJSON(intervencion) {
  const tipo = normalizarTipoGeometria(
    intervencion.geometriaTipo
  )

  if (tipo === 'Linea') {
    if (!geometriaLinealValida(intervencion.geometria, 2)) {
      return null
    }

    const coordenadas = intervencion.geometria
      .map(puntoLatLngAGeoJSON)
      .filter(Boolean)

    if (coordenadas.length < 2) return null

    return {
      type: 'LineString',
      coordinates: coordenadas,
    }
  }

  if (tipo === 'Poligono') {
    if (!geometriaLinealValida(intervencion.geometria, 3)) {
      return null
    }

    const coordenadas = intervencion.geometria
      .map(puntoLatLngAGeoJSON)
      .filter(Boolean)

    if (coordenadas.length < 3) return null

    return {
      type: 'Polygon',
      coordinates: [cerrarAnillo(coordenadas)],
    }
  }

  if (
    esNumeroValido(intervencion.latitud) &&
    esNumeroValido(intervencion.longitud)
  ) {
    return {
      type: 'Point',
      coordinates: [
        Number(intervencion.longitud),
        Number(intervencion.latitud),
      ],
    }
  }

  return null
}

export function obtenerEstadoGeometriaIntervencion(intervencion) {
  const geometry =
    crearGeometriaGeoJSON(intervencion)

  if (!geometry) {
    return {
      valida: false,
      tipo: intervencion?.geometriaTipo || '',
    }
  }

  return {
    valida: true,
    tipo: geometry.type,
  }
}

export function crearFeatureIntervencion(
  intervencion,
  periodoActivo,
  opciones = {}
) {
  const geometry =
    crearGeometriaGeoJSON(intervencion)

  if (!geometry) return null

  const properties = opciones.propiedadesShp
    ? crearPropiedadesShp(intervencion, periodoActivo)
    : crearPropiedadesGeoJSON(intervencion, periodoActivo)

  return {
    type: 'Feature',
    geometry,
    properties,
  }
}

export function crearFeatureCollectionIntervenciones(
  intervenciones = [],
  periodoActivo,
  opciones = {}
) {
  const features = intervenciones
    .map((intervencion) =>
      crearFeatureIntervencion(
        intervencion,
        periodoActivo,
        opciones
      )
    )
    .filter(Boolean)

  return {
    type: 'FeatureCollection',
    features,
  }
}

export function contarIntervencionesExportables(
  intervenciones = []
) {
  return intervenciones.filter((intervencion) =>
    Boolean(crearGeometriaGeoJSON(intervencion))
  ).length
}
