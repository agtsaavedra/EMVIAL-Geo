/**
 * Hook de datos derivados para intervenciones.
 *
 * Filtra por periodo, busqueda textual, tipo de obra y estado. Precalcula el
 * texto de busqueda cuando cambian los datos para no reconstruirlo en cada
 * filtro.
 */

import { useMemo } from 'react'

function normalizarTexto(valor) {
  return String(valor || '').toLowerCase().trim()
}

function crearTextoBusqueda(intervencion) {
  return normalizarTexto([
    intervencion.nombre,
    intervencion.obra,
    intervencion.ubicacion,
    intervencion.barrio,
    intervencion.estado,
    intervencion.fuente,
    intervencion.inspector,
    intervencion.realizo,
    intervencion.descripcion,
  ].join(' '))
}

export function useFiltrosIntervenciones({
  intervenciones = [],
  periodoActivo,
  busqueda = '',
  filtroObra = '',
  filtroEstado = '',
}) {
  const intervencionesIndexadas =
    useMemo(() => {
      return intervenciones.map(
        (intervencion) => ({
          intervencion,
          textoBusqueda:
            crearTextoBusqueda(intervencion),
        })
      )
    }, [intervenciones])

  const registrosDelPeriodo =
    useMemo(() => {
      return intervencionesIndexadas.filter(
        ({ intervencion }) =>
          intervencion.periodo === periodoActivo
      )
    }, [intervencionesIndexadas, periodoActivo])

  const intervencionesDelPeriodo =
    useMemo(() => {
      return registrosDelPeriodo.map(
        ({ intervencion }) => intervencion
      )
    }, [registrosDelPeriodo])

  const intervencionesFiltradas =
    useMemo(() => {
      const busquedaNormalizada =
        normalizarTexto(busqueda)

      return registrosDelPeriodo
        .filter(
          ({ intervencion, textoBusqueda }) => {
            return (
              textoBusqueda.includes(
                busquedaNormalizada
              ) &&
              (!filtroObra ||
                intervencion.obra === filtroObra) &&
              (!filtroEstado ||
                intervencion.estado === filtroEstado)
            )
          }
        )
        .map(
          ({ intervencion }) => intervencion
        )
    }, [
      registrosDelPeriodo,
      busqueda,
      filtroObra,
      filtroEstado,
    ])

  return {
    intervencionesDelPeriodo,
    intervencionesFiltradas,
  }
}
