export function useMapProps({
  form,
  setForm,

  intervencionesFiltradas,
  intervencionEditandoId,

  puntoSeleccionado,
  setPuntoSeleccionado,

  obtenerDireccion,

  barrioSeleccionado,
  setBarrioSeleccionado,

  mostrarBarrios,
  setMostrarBarrios,

  manejarEditarIntervencion,
  intervencionEnfocada,

  modoDibujo,
  setModoDibujo,

  sidebarAbierto,
  manejarEnfocarIntervencion,

  assetsPanelAbierto,
}) {
  return {
    form,
    setForm,

    intervencionesFiltradas,
    intervencionEditandoId,

    puntoSeleccionado,
    setPuntoSeleccionado,

    obtenerDireccion,

    barrioSeleccionado,
    setBarrioSeleccionado,

    mostrarBarrios,
    setMostrarBarrios,

    editarIntervencion:
      manejarEditarIntervencion,

    intervencionEnfocada,

    modoDibujo,
    setModoDibujo,

    sidebarAbierto,

    enfocarIntervencion:
      manejarEnfocarIntervencion,

    assetsPanelAbierto,
  }
}