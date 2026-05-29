import { useState } from 'react'

export function usePeriodo() {
  const [periodoActivo, setPeriodoActivo] = useState(() => {
    return new Date().toISOString().slice(0, 7)
  })

  return {
    periodoActivo,
    setPeriodoActivo,
  }
}