export function normalizarCallesUnicas(calles = []) {
  return [
    ...new Set(
      calles
        .map((calle) => String(calle || '').trim())
        .filter(Boolean)
    ),
  ]
}

export function calcularCuadrasPorInterferencias({
  interferencias = [],
  fallback = 0,
}) {
  const interferenciasUnicas =
    normalizarCallesUnicas(interferencias)

  if (interferenciasUnicas.length >= 2) {
    return String(interferenciasUnicas.length - 1)
  }

  if (interferenciasUnicas.length === 1) {
    return '1'
  }

  return String(Math.max(1, fallback))
}

export function crearAdvertenciaLineaMulticalle(
  nombresPorSegmento = []
) {
  const calles =
    normalizarCallesUnicas(nombresPorSegmento)

  if (calles.length <= 1) {
    return null
  }

  return {
    tipo: 'linea-multicalle',
    mensaje:
      `La linea dibujada recorre mas de una calle (${calles.join(', ')}). Para mantener datos consistentes, cargue cada calle como una intervencion separada.`,
    calles,
  }
}
