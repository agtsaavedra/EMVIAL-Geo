import { formInicial } from '@constants/formInicial'
import formStateCore from './formStateCore.cjs'

const {
  crearFormularioEdicionDesdeBase,
  obtenerPuntoSeleccionadoDesdeFormulario,
  tieneCambiosSinGuardar,
} = formStateCore

export function crearFormularioEdicion(intervencion = {}) {
  return crearFormularioEdicionDesdeBase(
    formInicial,
    intervencion
  )
}

export {
  obtenerPuntoSeleccionadoDesdeFormulario,
  tieneCambiosSinGuardar,
}
