import * as turf from '@turf/turf'
import barriosGeojsonRaw from '../../data/barrios.geojson?raw'

export const barriosGeojson = JSON.parse(barriosGeojsonRaw)

export const centroMarDelPlata = [-38.0055, -57.5426]

const PALETA_BARRIOS = [
  '#f97316',
  '#22c55e',
  '#06b6d4',
  '#a855f7',
  '#ec4899',
  '#eab308',
  '#14b8a6',
  '#ef4444',
  '#3b82f6',
  '#84cc16',
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
  '#f43f5e',
  '#0ea5e9',
  '#d946ef',
]

export function obtenerNombreBarrio(feature) {
  return feature?.properties?.soc_fomen || 'Sin nombre'
}

function indiceColorBarrio(nombre) {
  return String(nombre)
    .split('')
    .reduce(
      (acumulado, caracter) =>
        acumulado + caracter.charCodeAt(0),
      0
    ) % PALETA_BARRIOS.length
}

function obtenerColorBarrio(nombre) {
  return PALETA_BARRIOS[
    indiceColorBarrio(nombre)
  ]
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
  const color = obtenerColorBarrio(nombre)

  return {
    color: seleccionado ? '#0f172a' : color,
    weight: seleccionado ? 4 : 2,
    fillColor: color,
    fillOpacity: seleccionado ? 0.3 : 0.13,
    opacity: seleccionado ? 1 : 0.88,
    dashArray: seleccionado ? '' : '4 3',
  }
}

export function configurarBarrio(feature, layer) {
  const nombre = obtenerNombreBarrio(feature)

  layer.bindTooltip(nombre, {
    permanent: false,
    direction: 'center',
  })
}
