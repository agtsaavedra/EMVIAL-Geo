export function calcularStatsPorObra(intervenciones = []) {
  return Object.values(
    intervenciones.reduce((acc, intervencion) => {
      const obra = intervencion.obra || 'Sin obra'

      if (!acc[obra]) {
        acc[obra] = {
          obra,
          total: 0,
        }
      }

      acc[obra].total += 1

      return acc
    }, {})
  )
}