function normalizarTipo(tipo) {
  return String(tipo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function esGeometriaLinea(tipo) {
  const texto = normalizarTipo(tipo)

  return texto === 'linea' || texto.includes('nea')
}

export function esGeometriaPoligono(tipo) {
  return normalizarTipo(tipo) === 'poligono'
}

export function esGeometriaPunto(tipo) {
  return String(tipo || '').trim() === 'Punto'
}
