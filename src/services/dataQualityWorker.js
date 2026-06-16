import {
  analizarCalidadIntervenciones,
} from '@services/dataQuality'
import { logger } from '@services/logger'

let worker
let requestId = 0

function obtenerWorker() {
  if (worker) return worker

  worker = new Worker(
    new URL(
      '../workers/dataQuality.worker.js',
      import.meta.url
    ),
    {
      type: 'module',
    }
  )

  return worker
}

function analizarConWorker(intervenciones) {
  return new Promise((resolve, reject) => {
    const id = `${Date.now()}-${requestId += 1}`
    const workerActual = obtenerWorker()

    function limpiar() {
      workerActual.removeEventListener(
        'message',
        manejarMensaje
      )
      workerActual.removeEventListener(
        'error',
        manejarError
      )
    }

    function manejarMensaje(event) {
      if (event.data?.id !== id) return

      limpiar()

      if (event.data.ok) {
        resolve(event.data.reporte)
        return
      }

      reject(
        new Error(
          event.data.message ||
          'No se pudo analizar la calidad de datos.'
        )
      )
    }

    function manejarError(error) {
      limpiar()
      reject(error)
    }

    workerActual.addEventListener(
      'message',
      manejarMensaje
    )
    workerActual.addEventListener(
      'error',
      manejarError
    )
    workerActual.postMessage({
      id,
      intervenciones,
    })
  })
}

export async function analizarCalidadIntervencionesAsync(
  intervenciones = []
) {
  if (typeof Worker === 'undefined') {
    return analizarCalidadIntervenciones(
      intervenciones
    )
  }

  try {
    return await analizarConWorker(intervenciones)
  } catch (error) {
    logger.warn(
      'Fallback de calidad de datos sin worker:',
      error
    )

    return analizarCalidadIntervenciones(
      intervenciones
    )
  }
}
