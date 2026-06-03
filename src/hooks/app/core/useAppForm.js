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
