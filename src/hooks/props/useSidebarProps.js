/**
 * Hook adaptador de props para `Sidebar`.
 *
 * Agrupa formulario, búsqueda de direcciones y estado de edición con los
 * nombres que consume el componente lateral.
 */

// Punto de entrada público del hook.
export function useSidebarProps({
  sidebarAbierto,
  setSidebarAbierto,

  form,
  ubicacionAutomaticaLinea,
  ubicacionManualLinea,
  recalcularUbicacionLinea,
  manejarCambio,
  guardarIntervencion,

  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,

  intervencionEditandoId,
  manejarCancelarEdicion,
  hayCambiosSinGuardar,
  modoConsulta,
}) {
  // API pública que consume el resto de la aplicación.
  return {
    abierto: sidebarAbierto,
    setAbierto: setSidebarAbierto,

    form,
    ubicacionAutomaticaLinea,
    ubicacionManualLinea,
    recalcularUbicacionLinea,
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
    modoConsulta,
  }
}
