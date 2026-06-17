import { formInicial } from '@constants/formInicial'
import {
  crearFormularioEdicionDesdeBase,
  obtenerPuntoSeleccionadoDesdeFormulario,
  tieneCambiosSinGuardar,
} from './formStateCore.mjs'

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
