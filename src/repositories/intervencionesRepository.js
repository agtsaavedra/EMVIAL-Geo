import {
  normalizarIntervencion,
} from '@domain/intervencion'
import {
  validarIntervencionesRepository,
} from './intervencionesRepositoryContract.mjs'

function obtenerApiElectron() {
  if (!window.api) {
    throw new Error(
      'La API de Electron no esta disponible.'
    )
  }

  return window.api
}

export function crearIntervencionesRepositoryLocal({
  obtenerApi = obtenerApiElectron,
  normalizar = normalizarIntervencion,
} = {}) {
  function normalizarListaLocal(intervenciones = []) {
    return intervenciones.map((intervencion) =>
      normalizar(intervencion)
    )
  }

  return validarIntervencionesRepository({
    proveedor: 'local-electron',

    async obtenerTodas() {
      const datos =
        await obtenerApi().obtenerIntervenciones()

      return normalizarListaLocal(datos || [])
    },

    async guardar(intervencion) {
      const guardada =
        await obtenerApi().guardarIntervencion(
          normalizar(intervencion)
        )

      return normalizar(guardada)
    },

    async guardarMasivo(intervenciones = []) {
      const guardadas =
        await obtenerApi().guardarIntervencionesMasivo(
          normalizarListaLocal(intervenciones)
        )

      return normalizarListaLocal(guardadas || [])
    },

    async eliminar(id) {
      return await obtenerApi().eliminarIntervencion(id)
    },

    async obtenerHistorial(id) {
      const api = obtenerApi()

      if (!api.obtenerHistorialIntervencion) {
        return []
      }

      return await api.obtenerHistorialIntervencion(id)
    },
  })
}

export const intervencionesRepository =
  crearIntervencionesRepositoryLocal()
