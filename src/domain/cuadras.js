export function formatearCuadrasOperativas(valor) {
  if (!Number.isFinite(valor) || valor <= 0) {
    return ''
  }

  const redondeado =
    Math.max(0.5, Math.round(valor * 2) / 2)

  if (Number.isInteger(redondeado)) {
    return String(redondeado)
  }

  return redondeado.toFixed(1)
}
