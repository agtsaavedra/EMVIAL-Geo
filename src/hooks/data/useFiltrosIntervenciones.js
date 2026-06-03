/**
 * Hook de datos derivados para intervenciones.
 *
 * Filtra por período, búsqueda textual, tipo de obra y estado. Usa `useMemo`
 * para evitar recalcular filtros cuando las entradas no cambiaron.
 */

import { useMemo } from 'react'

// Normaliza texto para búsquedas simples sin distinguir mayúsculas/minúsculas.
function normalizarTexto(valor) {
  return String(valor || '').toLowerCase().trim()
}

// Punto de entrada público del hook.
export function useFiltrosIntervenciones({
  intervenciones = [],
  periodoActivo,
  busqueda = '',
  filtroObra = '',
  filtroEstado = '',
}) {
  const intervencionesDelPeriodo =
    useMemo(() => {
      return intervenciones.filter(
        (intervencion) =>
          intervencion.periodo === periodoActivo
      )
    }, [intervenciones, periodoActivo])

  const intervencionesFiltradas =
    useMemo(() => {
      const busquedaNormalizada =
        normalizarTexto(busqueda)

      return intervencionesDelPeriodo.filter(
        (intervencion) => {
          const texto = normalizarTexto(`
            ${intervencion.nombre || ''}
            ${intervencion.obra || ''}
            ${intervencion.ubicacion || ''}
            ${intervencion.barrio || ''}
            ${intervencion.estado || ''}
            ${intervencion.fuente || ''}
            ${intervencion.inspector || ''}
            ${intervencion.realizo || ''}
            ${intervencion.descripcion || ''}
          `)

          return (
            texto.includes(busquedaNormalizada) &&
            (!filtroObra ||
              intervencion.obra === filtroObra) &&
            (!filtroEstado ||
              intervencion.estado === filtroEstado)
          )
        }
      )
    }, [
      intervencionesDelPeriodo,
      busqueda,
      filtroObra,
      filtroEstado,
    ])

  // API pública que consume el resto de la aplicación.
  return {
    intervencionesDelPeriodo,
    intervencionesFiltradas,
  }
}