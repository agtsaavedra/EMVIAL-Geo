import { useMemo } from 'react'

function normalizarTexto(valor) {
  return String(valor || '').toLowerCase().trim()
}

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

  return {
    intervencionesDelPeriodo,
    intervencionesFiltradas,
  }
}