import {
  Marker,
  Popup,
  Polyline,
  Polygon,
} from 'react-leaflet'

import PopupIntervencion from './PopupIntervencion'
import { crearIconoColor } from '../../map/mapIcons'
import { obtenerColorIntervencion } from '../../map/mapColors'
import { useState } from 'react'

function IntervencionesLayer({
  intervenciones = [],
  editarIntervencion,
  enfocarIntervencion,
  modoDibujo,
}) {

  const [hoverId, setHoverId] = useState(null)


  function manejarClickCapa(e, intervencion) {
    e.originalEvent?.stopPropagation?.()

    if (modoDibujo) return

    // Primero enfocamos. MapFocus puede cerrar popup anterior.
    enfocarIntervencion?.(intervencion)

    // Después abrimos el popup, cuando el mapa ya se movió.
    setTimeout(() => {
      e.target?.openPopup?.()
    }, 250)
  }

  return (
    <>
      {intervenciones.map((intervencion) => {
        const color = obtenerColorIntervencion(intervencion)

        if (
          intervencion.geometriaTipo === 'Línea' &&
          intervencion.geometria?.length > 1
        ) {
          return (
            <Polyline
              key={intervencion.id}
              positions={intervencion.geometria}
              pathOptions={{
                color,
                weight: hoverId === intervencion.id ? 9 : 7,
                opacity: hoverId === intervencion.id ? 1 : 0.92,
              }}
              eventHandlers={{
                click: (e) => manejarClickCapa(e, intervencion),
                mouseover: () => setHoverId(intervencion.id),
                mouseout: () => setHoverId(null),
              }}
            >
              <Popup>
                <PopupIntervencion
                  intervencion={intervencion}
                  editarIntervencion={editarIntervencion}
                />
              </Popup>
            </Polyline>
          )
        }

        if (
          intervencion.geometriaTipo === 'Polígono' &&
          intervencion.geometria?.length > 2
        ) {
          return (
            <Polygon
              key={intervencion.id}
              positions={intervencion.geometria}
              pathOptions={{
                color,
                weight: hoverId === intervencion.id ? 6 : 4,
                fillColor: color,
                fillOpacity: hoverId === intervencion.id ? 0.38 : 0.25,
              }}
              eventHandlers={{
                click: (e) => manejarClickCapa(e, intervencion),
                mouseover: () => setHoverId(intervencion.id),
                mouseout: () => setHoverId(null),
              }}
            >
              <Popup>
                <PopupIntervencion
                  intervencion={intervencion}
                  editarIntervencion={editarIntervencion}
                />
              </Popup>
            </Polygon>
          )
        }

        if (intervencion.latitud && intervencion.longitud) {
          return (
            <Marker
              key={intervencion.id}
              position={[
                parseFloat(intervencion.latitud),
                parseFloat(intervencion.longitud),
              ]}
              icon={crearIconoColor(color)}
              eventHandlers={{
                click: (e) => manejarClickCapa(e, intervencion),
                mouseover: () => setHoverId(intervencion.id),
                mouseout: () => setHoverId(null),
              }}
            >
              <Popup>
                <PopupIntervencion
                  intervencion={intervencion}
                  editarIntervencion={editarIntervencion}
                />
              </Popup>
            </Marker>
          )
        }

        return null
      })}
    </>
  )
}

export default IntervencionesLayer