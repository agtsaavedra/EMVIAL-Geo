import {
  calcularCuadrasLinea,
} from '@services/callesMetrics'

self.addEventListener('message', async (event) => {
  const {
    id,
    geometria,
  } = event.data || {}

  try {
    const resultado =
      await calcularCuadrasLinea(geometria)

    self.postMessage({
      id,
      ok: true,
      resultado,
    })
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      message:
        error?.message ||
        'No se pudo calcular la red vial.',
    })
  }
})
