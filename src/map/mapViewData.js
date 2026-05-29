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
  intervencionesFiltradas,
  intervencionEditandoId
) {
  return intervencionesFiltradas.filter(
    (intervencion) =>
      intervencion.id !==
      intervencionEditandoId
  )
}

export function obtenerStatsMapa(
  intervencionesVisibles
) {
  return calcularStatsPorObra(
    intervencionesVisibles
  )
}