import {
  normalizarIntervencion,
} from '@domain/intervencion'

function obtenerApi() {
  if (!window.api) {
    throw new Error(
      'La API de Electron no esta disponible.'
    )
  }

  return window.api
}

function normalizarLista(intervenciones = []) {
  return intervenciones.map((intervencion) =>
    normalizarIntervencion(intervencion)
  )
}

export const intervencionesRepository = {
  async obtenerTodas() {
    const datos =
      await obtenerApi().obtenerIntervenciones()

    return normalizarLista(datos || [])
  },

  async guardar(intervencion) {
    const guardada =
      await obtenerApi().guardarIntervencion(
        normalizarIntervencion(intervencion)
      )

    return normalizarIntervencion(guardada)
  },

  async guardarMasivo(intervenciones = []) {
    const guardadas =
      await obtenerApi().guardarIntervencionesMasivo(
        normalizarLista(intervenciones)
      )

    return normalizarLista(guardadas || [])
  },

  async eliminar(id) {
    return await obtenerApi().eliminarIntervencion(id)
  },

  async obtenerHistorial(id) {
    if (!obtenerApi().obtenerHistorialIntervencion) {
      return []
    }

    return await obtenerApi()
      .obtenerHistorialIntervencion(id)
  },
}
