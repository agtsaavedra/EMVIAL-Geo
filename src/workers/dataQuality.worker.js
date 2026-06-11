import {
  analizarCalidadIntervenciones,
} from '@services/dataQuality'

self.onmessage = (event) => {
  const { id, intervenciones } = event.data || {}

  try {
    const reporte =
      analizarCalidadIntervenciones(
        intervenciones || []
      )

    self.postMessage({
      id,
      ok: true,
      reporte,
    })
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      message:
        error?.message ||
        'No se pudo analizar la calidad de datos.',
    })
  }
}
