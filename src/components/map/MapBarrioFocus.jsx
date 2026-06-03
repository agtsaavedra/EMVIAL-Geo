import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

import {
  barriosGeojson,
  obtenerNombreBarrio,
} from '@map/data/barrios'

function MapBarrioFocus({ barrioSeleccionado }) {
  const map = useMap()

  useEffect(() => {
    if (!barrioSeleccionado) return

    const feature = barriosGeojson.features.find(
      (item) =>
        obtenerNombreBarrio(item) === barrioSeleccionado
    )

    if (!feature) return

    const bounds = L.geoJSON(feature).getBounds()

    if (!bounds.isValid()) return

    map.fitBounds(bounds, {
      padding: [35, 35],
      maxZoom: 16,
    })
  }, [map, barrioSeleccionado])

  return null
}

export default MapBarrioFocus