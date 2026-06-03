/**
 * Hook utilitario de debounce.
 *
 * Devuelve una versión demorada de un valor para evitar trabajo innecesario en
 * cada pulsación de teclado.
 */

import { useEffect, useState } from 'react'

// Punto de entrada público del hook.
export function useDebouncedValue(
  value,
  delay = 200
) {
  const [
    debouncedValue,
    setDebouncedValue,
  ] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}