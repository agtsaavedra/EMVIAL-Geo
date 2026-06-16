export function calcularCuadrasPorInterferencias({
  interferencias = [],
  fallback = 0,
}) {
  if (interferencias.length >= 2) {
    return String(interferencias.length - 1)
  }

  if (interferencias.length === 1) {
    return '1'
  }

  return String(Math.max(1, fallback))
}
