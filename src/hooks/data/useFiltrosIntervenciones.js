function normalizarTexto(valor) {
  return String(valor || '').toLowerCase()
}

function obtenerTextoBuscable(intervencion) {
  return `
    ${intervencion.nombre || ''}
    ${intervencion.obra || ''}
    ${intervencion.ubicacion || ''}
    ${intervencion.barrio || ''}
    ${intervencion.estado || ''}
    ${intervencion.fuente || ''}
    ${intervencion.inspector || ''}
    ${intervencion.realizo || ''}
    ${intervencion.descripcion || ''}
  `.toLowerCase()
}

function coincideConBusqueda(
  intervencion,
  busqueda
) {
  const textoBuscable =
    obtenerTextoBuscable(intervencion)

  const busquedaNormalizada =
    normalizarTexto(busqueda)

  return textoBuscable.includes(
    busquedaNormalizada
  )
}

function coincideConObra(
  intervencion,
  filtroObra
) {
  return (
    !filtroObra ||
    intervencion.obra === filtroObra
  )
}

function coincideConEstado(
  intervencion,
  filtroEstado
) {
  return (
    !filtroEstado ||
    intervencion.estado === filtroEstado
  )
}

export function useFiltrosIntervenciones({
  intervenciones = [],
  periodoActivo,
  busqueda = '',
  filtroObra = '',
  filtroEstado = '',
}) {
  // =====================================================
  // INTERVENCIONES DEL PERÍODO ACTIVO
  // =====================================================

  const intervencionesDelPeriodo =
    intervenciones.filter(
      (intervencion) =>
        intervencion.periodo ===
        periodoActivo
    )

  // =====================================================
  // INTERVENCIONES FILTRADAS
  // =====================================================
  // Filtros actuales:
  // - búsqueda libre
  // - obra
  // - estado
  //
  // El barrio ya no se filtra desde Topbar.
  // Ahora se usa como navegación espacial desde el mapa.

  const intervencionesFiltradas =
    intervencionesDelPeriodo.filter(
      (intervencion) => {
        const coincideBusqueda =
          coincideConBusqueda(
            intervencion,
            busqueda
          )

        const coincideObra =
          coincideConObra(
            intervencion,
            filtroObra
          )

        const coincideEstado =
          coincideConEstado(
            intervencion,
            filtroEstado
          )

        return (
          coincideBusqueda &&
          coincideObra &&
          coincideEstado
        )
      }
    )

  return {
    intervencionesDelPeriodo,
    intervencionesFiltradas,
  }
}
