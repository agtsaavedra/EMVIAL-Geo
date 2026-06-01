import { useEffect, useState } from 'react'

function obtenerPeriodoActual() {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = String(
    ahora.getMonth() + 1
  ).padStart(2, '0')

  return `${anio}-${mes}`
}

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

  return {
    periodoActivo,
    setPeriodoActivo,
  }
}