/**
 * Hook de notificaciones tipo toast.
 *
 * Permite mostrar mensajes temporales con tipo, duración y acción opcional.
 */

import { useRef, useState } from 'react'

// Punto de entrada público del hook.
export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  // Cierra el toast visible y limpia su temporizador.
  function cerrarToast() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setToast(null)
  }

  // Muestra una notificación temporal con tipo y acción opcional.
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

  // API pública que consume el resto de la aplicación.
  return {
    toast,
    mostrarToast,
    cerrarToast,
  }
}
