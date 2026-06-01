import { useEffect, useState } from 'react'

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

  return {
    mostrarSplash,
  }
}