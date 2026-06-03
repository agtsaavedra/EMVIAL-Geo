import * as turf from '@turf/turf'
import barriosGeojsonRaw from '../../data/barrios.geojson?raw'

export const barriosGeojson = JSON.parse(barriosGeojsonRaw)

export const centroMarDelPlata = [-38.0055, -57.5426]

export function obtenerNombreBarrio(feature) {
  return feature?.properties?.soc_fomen || 'Sin nombre'
}

export function detectarBarrio(lat, lon) {
  const punto = turf.point([lon, lat])

  const barrio = barriosGeojson.features.find((feature) =>
    turf.booleanPointInPolygon(punto, feature)
  )

  return barrio ? obtenerNombreBarrio(barrio) : ''
}

export function estiloBarrio(feature, barrioSeleccionado) {
  const nombre = obtenerNombreBarrio(feature)
  const seleccionado = barrioSeleccionado && nombre === barrioSeleccionado
  const color = feature?.properties?.colorb || '#2563eb'

  return {
    color: seleccionado ? '#111827' : color,
    weight: seleccionado ? 4 : 2,
    fillColor: color,
    fillOpacity: seleccionado ? 0.42 : 0.12,
  }
}

export function configurarBarrio(feature, layer) {
  const nombre = obtenerNombreBarrio(feature)

  layer.bindTooltip(nombre, {
    permanent: false,
    direction: 'center',
  })
}