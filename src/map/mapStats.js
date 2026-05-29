export function calcularStatsPorObra(intervenciones = []) {
  return Object.values(
    intervenciones.reduce((acc, intervencion) => {
      const obra = intervencion.obra || 'Sin obra'

      if (!acc[obra]) {
        acc[obra] = {
          obra,
          total: 0,
          lineas: 0,
          puntos: 0,
          poligonos: 0,
        }
      }

      acc[obra].total += 1

      if (intervencion.geometriaTipo === 'Línea') {
        acc[obra].lineas += 1
      }

      if (intervencion.geometriaTipo === 'Punto') {
        acc[obra].puntos += 1
      }

      if (intervencion.geometriaTipo === 'Polígono') {
        acc[obra].poligonos += 1
      }

      return acc
    }, {})
  )
}