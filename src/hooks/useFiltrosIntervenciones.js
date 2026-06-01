export function useFiltrosIntervenciones({
  intervenciones,
  periodoActivo,
  busqueda,
  filtroObra,
  filtroEstado,
}) {
  const intervencionesDelPeriodo = intervenciones.filter((intervencion) => {
    return intervencion.periodo === periodoActivo
  })


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