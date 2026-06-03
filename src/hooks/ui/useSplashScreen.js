/**
 * Hook de splash inicial.
 *
 * Mantiene visible la animación de bienvenida durante un tiempo configurable.
 */

import { useEffect, useState } from 'react'

// Punto de entrada público del hook.
export function useSplashScreen(
  duracion = 2000
) {
  const [
    mostrarSplash,
    setMostrarSplash,
  ] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarSplash(false)
    }, duracion)

    return () => clearTimeout(timer)
  }, [duracion])

  // API pública que consume el resto de la aplicación.
  return {
    mostrarSplash,
  }
}