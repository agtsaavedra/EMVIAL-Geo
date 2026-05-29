import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function MapCenter({ punto, geometriaTipo }) {
  const map = useMap()

  useEffect(() => {
    if (punto && geometriaTipo === 'Punto') {
      map.setView(punto, 16)
    }
  }, [map, punto, geometriaTipo])

  return null
}

export default MapCenter