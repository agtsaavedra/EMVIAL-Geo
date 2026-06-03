/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

// Punto de entrada visual del componente.
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