import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

function obtenerBoundsIntervencion(intervencion) {
  if (intervencion?.geometria?.length) {
    return L.latLngBounds(intervencion.geometria)
  }

  if (intervencion?.latitud && intervencion?.longitud) {
    const lat = parseFloat(intervencion.latitud)
    const lon = parseFloat(intervencion.longitud)

    return L.latLngBounds([[lat, lon]])
  }

  return null
}

function MapFocus({ intervencion }) {
  const map = useMap()

  useEffect(() => {
    if (!intervencion) return

    const bounds = obtenerBoundsIntervencion(intervencion)

    if (!bounds || !bounds.isValid()) return

    // Cierra cualquier popup anterior cuando el foco viene del panel.
    map.closePopup()

    if (
      intervencion.geometriaTipo === 'Punto' ||
      bounds.getNorthEast().equals(bounds.getSouthWest())
    ) {
      map.setView(bounds.getCenter(), 17)
      return
    }

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 17,
    })
  }, [map, intervencion])

  return null
}

export default MapFocus