import {
  barriosGeojson,
  obtenerNombreBarrio,
} from './barrios'

import { calcularStatsPorObra } from './mapStats'

export function obtenerBarriosFiltrados(
  barrioSeleccionado
) {
  return {
    ...barriosGeojson,
    features: barrioSeleccionado
      ? barriosGeojson.features.filter(
          (feature) =>
            obtenerNombreBarrio(feature) ===
            barrioSeleccionado
        )
      : barriosGeojson.features,
  }
}

export function obtenerIntervencionesVisibles(
  intervencionesFiltradas
) {
  // Las intervenciones guardadas SIEMPRE deben verse,
  // incluso cuando se están editando.
  return intervencionesFiltradas
}

export function obtenerStatsMapa(
  intervencionesVisibles
) {
  return calcularStatsPorObra(
    intervencionesVisibles
  )
}