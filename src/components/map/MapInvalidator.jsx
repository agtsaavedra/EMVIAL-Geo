import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

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