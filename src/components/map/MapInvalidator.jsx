import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function MapInvalidator() {
  const map = useMap()

  useEffect(() => {
    function invalidar() {
      map.invalidateSize()
    }

    const timers = [
      setTimeout(invalidar, 100),
      setTimeout(invalidar, 300),
      setTimeout(invalidar, 600),
    ]

    window.addEventListener('resize', invalidar)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', invalidar)
    }
  }, [map])

  return null
}

export default MapInvalidator