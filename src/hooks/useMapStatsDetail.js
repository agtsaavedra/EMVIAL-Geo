import { useMemo } from 'react'

export function useMapStatsDetail(intervenciones = []) {
  return useMemo(() => {
    const total = intervenciones.length

    const porEstado = {}
    const porGeometria = {}
    const porBarrio = {}

    intervenciones.forEach((intervencion) => {
      const estado =
        intervencion.estado || 'Sin estado'

      const geometria =
        intervencion.geometriaTipo || 'Sin geometría'

      const barrio =
        intervencion.barrio || 'Sin barrio'

      porEstado[estado] =
        (porEstado[estado] || 0) + 1

      porGeometria[geometria] =
        (porGeometria[geometria] || 0) + 1

      porBarrio[barrio] =
        (porBarrio[barrio] || 0) + 1
    })

    return {
      total,
      porEstado: Object.entries(porEstado),
      porGeometria: Object.entries(porGeometria),
      porBarrio: Object.entries(porBarrio)
        .sort((a, b) => b[1] - a[1]),
    }
  }, [intervenciones])
}