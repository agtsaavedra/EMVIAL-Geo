export function useFiltrosIntervenciones({
  intervenciones,
  periodoActivo,
  busqueda,
  filtroObra,
  filtroEstado,
  filtroBarrio,
}) {
  const intervencionesDelPeriodo = intervenciones.filter((intervencion) => {
    return intervencion.periodo === periodoActivo
  })

  const barriosDisponibles = [
    ...new Set(
      intervencionesDelPeriodo
        .map((intervencion) => intervencion.barrio)
        .filter(Boolean)
    ),
  ].sort()

  const intervencionesFiltradas = intervencionesDelPeriodo.filter(
    (intervencion) => {
      const texto = `
        ${intervencion.nombre}
        ${intervencion.obra}
        ${intervencion.ubicacion}
        ${intervencion.barrio}
        ${intervencion.estado}
        ${intervencion.fuente}
        ${intervencion.inspector}
        ${intervencion.realizo}
        ${intervencion.descripcion}
      `.toLowerCase()

      const coincideBusqueda = texto.includes(busqueda.toLowerCase())

      const coincideObra =
        !filtroObra || intervencion.obra === filtroObra

      const coincideEstado =
        !filtroEstado || intervencion.estado === filtroEstado

      const coincideBarrio =
        !filtroBarrio || intervencion.barrio === filtroBarrio

      return (
        coincideBusqueda &&
        coincideObra &&
        coincideEstado &&
        coincideBarrio
      )
    }
  )

  return {
    intervencionesDelPeriodo,
    intervencionesFiltradas,
    barriosDisponibles,
  }
}