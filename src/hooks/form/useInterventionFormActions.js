import { formInicial } from '@constants/formInicial'

import {
  esGeometriaLinea,
} from './geometryType'
import {
  crearFormularioEdicion,
  obtenerPuntoSeleccionadoDesdeFormulario,
} from './formState'
import {
  obtenerErrorGeometria,
} from './geometryValidation'

export function useInterventionFormActions({
  form,
  setForm,
  setFormOriginal,
  periodoActivo,
  guardarIntervencionEnDB,
  setIntervencionEditandoId,
  setPuntoSeleccionado,
  setBarrioSeleccionado,
  setSugerencias,
  setBuscandoDireccion,
  mostrarToast,
  invalidarUbicacionAutoLinea,
  restaurarUbicacionLineaManual,
}) {
  function validarGeometria() {
    const error = obtenerErrorGeometria(form)

    if (error) {
      mostrarToast(
        error,
        'error'
      )

      return false
    }

    return true
  }

  async function guardarIntervencion(e) {
    e.preventDefault()

    if (!validarGeometria()) return

    await guardarIntervencionEnDB({
      ...form,
      periodo: periodoActivo,
      estado: 'Finalizada',
    })

    mostrarToast(
      form.id
        ? 'Intervención actualizada correctamente.'
        : 'Intervención guardada correctamente.',
      'success'
    )

    setPuntoSeleccionado(null)
    setForm(formInicial)
    setFormOriginal(null)
    invalidarUbicacionAutoLinea()
    setBarrioSeleccionado('')
    setSugerencias([])
    setIntervencionEditandoId(null)
  }

  function editarIntervencion(intervencion) {
    setIntervencionEditandoId(
      intervencion.id
    )

    const formEditado =
      crearFormularioEdicion(intervencion)

    setForm(formEditado)
    setFormOriginal(formEditado)
    invalidarUbicacionAutoLinea()

    if (
      esGeometriaLinea(formEditado.geometriaTipo) &&
      formEditado.ubicacion
    ) {
      restaurarUbicacionLineaManual()
    }

    setPuntoSeleccionado(
      obtenerPuntoSeleccionadoDesdeFormulario(
        formEditado
      )
    )
  }

  function cancelarEdicion() {
    setIntervencionEditandoId(null)
    setForm(formInicial)
    setFormOriginal(null)
    invalidarUbicacionAutoLinea()
    setPuntoSeleccionado(null)
    setBarrioSeleccionado('')
    setSugerencias([])
    setBuscandoDireccion(false)

    mostrarToast(
      'Edición cancelada.',
      'info'
    )
  }

  return {
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
  }
}
