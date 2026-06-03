/**
 * Hook de período activo.
 *
 * Trabaja con períodos en formato `YYYY-MM` y recuerda el último período usado
 * mediante localStorage.
 */

import { useEffect, useState } from 'react'

// Calcula el período actual en formato YYYY-MM.
function obtenerPeriodoActual() {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = String(
    ahora.getMonth() + 1
  ).padStart(2, '0')

  return `${anio}-${mes}`
}

// Obtiene el período guardado o usa el período actual como fallback.
function obtenerPeriodoInicial() {
  const periodoGuardado =
    localStorage.getItem(
      'emvial-periodo-activo'
    )

  return (
    periodoGuardado ||
    obtenerPeriodoActual()
  )
}

// Punto de entrada público del hook.
export function usePeriodo() {
  const [
    periodoActivo,
    setPeriodoActivo,
  ] = useState(() =>
    obtenerPeriodoInicial()
  )

  useEffect(() => {
    localStorage.setItem(
      'emvial-periodo-activo',
      periodoActivo
    )
  }, [periodoActivo])

  // API pública que consume el resto de la aplicación.
  return {
    periodoActivo,
    setPeriodoActivo,
  }
}