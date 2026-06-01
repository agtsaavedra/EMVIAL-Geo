export function useSidebarProps({
  sidebarAbierto,
  setSidebarAbierto,

  form,
  manejarCambio,
  guardarIntervencion,

  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,

  intervencionEditandoId,
  manejarCancelarEdicion,
  hayCambiosSinGuardar,
}) {
  return {
    abierto: sidebarAbierto,
    setAbierto: setSidebarAbierto,

    form,
    manejarCambio,
    guardarIntervencion,

    buscarDireccion,
    sugerencias,
    buscandoDireccion,
    seleccionarSugerencia,

    activoEditandoId:
      intervencionEditandoId,

    cancelarEdicion:
      manejarCancelarEdicion,

    hayCambiosSinGuardar,
  }
}