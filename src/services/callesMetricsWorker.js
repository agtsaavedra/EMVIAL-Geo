import {
  calcularCuadrasLinea,
} from '@services/callesMetrics'

let worker
let requestId = 0

function obtenerWorker() {
  if (worker) return worker

  worker = new Worker(
    new URL(
      '../workers/callesMetrics.worker.js',
      import.meta.url
    ),
    {
      type: 'module',
    }
  )

  return worker
}

function calcularConWorker(geometria) {
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
        resolve(event.data.resultado)
        return
      }

      reject(
        new Error(
          event.data.message ||
          'No se pudo calcular la red vial.'
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
      geometria,
    })
  })
}

export async function calcularCuadrasLineaAsync(
  geometria = []
) {
  if (typeof Worker === 'undefined') {
    return calcularCuadrasLinea(geometria)
  }

  try {
    return await calcularConWorker(geometria)
  } catch (error) {
    console.warn(
      'Fallback de red vial sin worker:',
      error
    )

    return calcularCuadrasLinea(geometria)
  }
}
