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
    function invalidar() {
      map.invalidateSize()
    }

    const timers = [
      setTimeout(invalidar, 80),
      setTimeout(invalidar, 250),
      setTimeout(invalidar, 500),
    ]

    window.addEventListener('resize', invalidar)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', invalidar)
    }
  }, [map, refreshKey])

  return null
}

export default MapInvalidator