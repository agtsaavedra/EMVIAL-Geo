/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

// Punto de entrada visual del componente.
function MapInvalidator({ refreshKey }) {
  const map = useMap()

  useEffect(() => {
    let animationFrame = null
    let timerFinal = null

    function invalidar() {
      map.invalidateSize({
        animate: false,
        pan: false,
        debounceMoveend: true,
      })
    }

    function programarInvalidacion() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }

      animationFrame =
        requestAnimationFrame(invalidar)

      clearTimeout(timerFinal)
      timerFinal = setTimeout(invalidar, 320)
    }

    const contenedor =
      map.getContainer().parentElement ||
      map.getContainer()

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(
          programarInvalidacion
        )
        : null

    observer?.observe(contenedor)
    window.addEventListener(
      'resize',
      programarInvalidacion
    )
    programarInvalidacion()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }

      clearTimeout(timerFinal)
      observer?.disconnect()
      window.removeEventListener(
        'resize',
        programarInvalidacion
      )
    }
  }, [map, refreshKey])

  return null
}

export default MapInvalidator
