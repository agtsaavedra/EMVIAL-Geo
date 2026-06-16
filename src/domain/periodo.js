const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export function formatearPeriodo(periodo = '') {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo)

  if (!match) return periodo || 'Sin periodo'

  const anio = match[1]
  const mes = Number(match[2])
  const nombreMes = MESES[mes - 1]

  if (!nombreMes) return periodo

  return `${nombreMes} de ${anio}`
}
