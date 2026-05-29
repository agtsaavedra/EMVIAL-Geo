import { useRef, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  function mostrarToast(mensaje, tipo = 'info') {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToast({
      mensaje,
      tipo,
    })

    timerRef.current = setTimeout(() => {
      setToast(null)
    }, 3200)
  }

  return {
    toast,
    mostrarToast,
  }
}