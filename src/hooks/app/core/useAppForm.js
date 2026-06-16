/*
  useAppForm

  Agrupa la lógica vinculada al formulario de intervención:
  alta/edición/cancelación, geocoding y uso de la imagen guía como fuente.

  Funciona como puente entre el estado del formulario, el mapa y los servicios
  auxiliares de búsqueda geográfica.
*/

import { useFormularioIntervencion } from '@hooks/form/useFormularioIntervencion'
import { useGeocoding } from '@hooks/form/useGeocoding'
import { useGuideOverlayWithSource } from '@hooks/map/useGuideOverlayWithSource'

export function useAppForm({
  periodoActivo,
  guardarIntervencionEnDB,

  setIntervencionEditandoId,
  setPuntoSeleccionado,
  setBarrioSeleccionado,

  setFiltroObra,
  setFiltroEstado,

  setSugerencias,
  setBuscandoDireccion,

  mostrarToast,
}) {
  const {
    form,
    setForm,
    ubicacionAutomaticaLinea,
    ubicacionManualLinea,
    recalcularUbicacionLinea,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,
  } = useFormularioIntervencion({
    periodoActivo,
    guardarIntervencionEnDB,
    setIntervencionEditandoId,
    setPuntoSeleccionado,
    setBarrioSeleccionado,
    setFiltroObra,
    setFiltroEstado,
    setSugerencias,
    setBuscandoDireccion,
    mostrarToast,
  })

  const {
    guideOverlay,
    guideOverlayConAcciones,
  } = useGuideOverlayWithSource({
    setForm,
    mostrarToast,
  })

  const {
    obtenerDireccion,
    buscarDireccion,
    seleccionarSugerencia,
  } = useGeocoding({
    form,
    setForm,
    setPuntoSeleccionado,
    setSugerencias,
    setBuscandoDireccion,
    mostrarToast,
  })

  return {
    form,
    setForm,
    ubicacionAutomaticaLinea,
    ubicacionManualLinea,
    recalcularUbicacionLinea,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,

    guideOverlay,
    guideOverlayConAcciones,

    obtenerDireccion,
    buscarDireccion,
    seleccionarSugerencia,
  }
}
