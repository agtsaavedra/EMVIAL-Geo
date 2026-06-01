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
  intervencionEnfocada,
}) {

  const [hoverId, setHoverId] = useState(null)
  const idEnfocado = intervencionEnfocada?.id

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
                weight:
                  idEnfocado === intervencion.id
                    ? 10
                    : hoverId === intervencion.id
                      ? 9
                      : 7,
                opacity:
                  idEnfocado === intervencion.id
                    ? 1
                    : hoverId === intervencion.id
                      ? 1
                      : 0.92,
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
                weight:
                  idEnfocado === intervencion.id
                    ? 7
                    : hoverId === intervencion.id
                      ? 6
                      : 4,
                fillOpacity:
                  idEnfocado === intervencion.id
                    ? 0.42
                    : hoverId === intervencion.id
                      ? 0.38
                      : 0.25,
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
              icon={crearIconoColor(
                color,
                idEnfocado === intervencion.id
                  ? 28
                  : hoverId === intervencion.id
                    ? 22
                    : 16
              )}
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