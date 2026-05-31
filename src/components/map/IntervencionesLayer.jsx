import {
  Marker,
  Popup,
  Polyline,
  Polygon,
} from 'react-leaflet'

import PopupIntervencion from './PopupIntervencion'
import { crearIconoColor } from '../../map/mapIcons'
import { obtenerColorIntervencion } from '../../map/mapColors'

function IntervencionesLayer({
  intervenciones = [],
  editarIntervencion,
  enfocarIntervencion,
  modoDibujo,
}) {
  function manejarClickCapa(e, intervencion) {
    // Si estamos en modo consulta, el click NO debe crear geometría nueva.
    if (!modoDibujo) {
      e.originalEvent?.stopPropagation?.()
    }

    // Enfoca la intervención aunque sea línea/polígono.
    enfocarIntervencion?.(intervencion)

    // Reabre el popup después del centrado/zoom.
    setTimeout(() => {
      e.target?.openPopup?.()
    }, 180)
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
              pathOptions={{ color, weight: 5 }}
              eventHandlers={{
                click: (e) => manejarClickCapa(e, intervencion),
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
                weight: 4,
                fillColor: color,
                fillOpacity: 0.25,
              }}
              eventHandlers={{
                click: (e) => manejarClickCapa(e, intervencion),
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