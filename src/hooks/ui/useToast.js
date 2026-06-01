import { useRef, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  function cerrarToast() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToast(null)
  }

  function mostrarToast(
    mensaje,
    tipo = 'info',
    opciones = {}
  ) {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToast({
      mensaje,
      tipo,
      accionTexto: opciones.accionTexto,
      onAccion: opciones.onAccion,
    })

    timerRef.current = setTimeout(() => {
      setToast(null)
    }, opciones.duracion || 4200)
  }

  return {
    toast,
    mostrarToast,
    cerrarToast,
  }
}
