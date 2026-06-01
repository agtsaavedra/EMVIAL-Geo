import { useState } from 'react'

import {
  Marker,
  Popup,
  Polyline,
  Polygon,
} from 'react-leaflet'

import PopupIntervencion from './PopupIntervencion'

import { crearIconoColor } from '@map/mapIcons'
import { obtenerColorIntervencion } from '@map/mapColors'

function IntervencionesLayer({
  intervenciones = [],
  editarIntervencion,
  enfocarIntervencion,
  modoDibujo,
  intervencionEnfocada,
  intervencionResaltadaId,
}) {
  // =====================================================
  // ESTADO DE HOVER / FOCO
  // =====================================================

  const [hoverId, setHoverId] =
    useState(null)

  const idEnfocado =
    intervencionEnfocada?.id

  // =====================================================
  // EVENTOS
  // =====================================================

  function manejarClickCapa(
    e,
    intervencion
  ) {
    e.originalEvent?.stopPropagation?.()

    if (modoDibujo) return

    enfocarIntervencion?.(intervencion)

    setTimeout(() => {
      e.target?.openPopup?.()
    }, 250)
  }

  function manejarMouseOver(id) {
    setHoverId(id)
  }

  function manejarMouseOut() {
    setHoverId(null)
  }

  // =====================================================
  // HELPERS VISUALES
  // =====================================================

  function estaEnHover(intervencion) {
    return (
      hoverId === intervencion.id ||
      intervencionResaltadaId ===
        intervencion.id
    )
  }

  function estaEnfocada(intervencion) {
    return idEnfocado === intervencion.id
  }

function obtenerOpcionesLinea(
  intervencion,
  color
) {
  const enfocada =
    estaEnfocada(intervencion)

  const hover =
    estaEnHover(intervencion)

  return {
    color,
    weight: enfocada
      ? 13
      : hover
        ? 11
        : 7,

    opacity: enfocada || hover
      ? 1
      : 0.82,

    lineCap: 'round',
    lineJoin: 'round',

    className:
      enfocada || hover
        ? 'leaflet-path-glow'
        : '',
  }
}

function obtenerOpcionesPoligono(
  intervencion,
  color
) {
  const enfocada =
    estaEnfocada(intervencion)

  const hover =
    estaEnHover(intervencion)

  return {
    color,
    weight: enfocada
      ? 9
      : hover
        ? 7
        : 4,

    fillColor: color,

    fillOpacity: enfocada
      ? 0.5
      : hover
        ? 0.44
        : 0.22,

    opacity: enfocada || hover
      ? 1
      : 0.82,

    className:
      enfocada || hover
        ? 'leaflet-path-glow'
        : '',
  }
}
  function obtenerTamanoIcono(
    intervencion
  ) {
    if (estaEnfocada(intervencion)) {
      return 28
    }

    if (estaEnHover(intervencion)) {
      return 22
    }

    return 16
  }

  function obtenerEventos(intervencion) {
    return {
      click: (e) =>
        manejarClickCapa(
          e,
          intervencion
        ),

      mouseover: () =>
        manejarMouseOver(
          intervencion.id
        ),

      mouseout:
        manejarMouseOut,
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {intervenciones.map((intervencion) => {
        const color =
          obtenerColorIntervencion(
            intervencion
          )

        if (
          intervencion.geometriaTipo ===
            'Línea' &&
          intervencion.geometria?.length > 1
        ) {
          return (
            <Polyline
              key={intervencion.id}
              positions={intervencion.geometria}
              pathOptions={obtenerOpcionesLinea(
                intervencion,
                color
              )}
              eventHandlers={obtenerEventos(
                intervencion
              )}
            >
              <Popup>
                <PopupIntervencion
                  intervencion={intervencion}
                  editarIntervencion={
                    editarIntervencion
                  }
                />
              </Popup>
            </Polyline>
          )
        }

        if (
          intervencion.geometriaTipo ===
            'Polígono' &&
          intervencion.geometria?.length > 2
        ) {
          return (
            <Polygon
              key={intervencion.id}
              positions={intervencion.geometria}
              pathOptions={obtenerOpcionesPoligono(
                intervencion,
                color
              )}
              eventHandlers={obtenerEventos(
                intervencion
              )}
            >
              <Popup>
                <PopupIntervencion
                  intervencion={intervencion}
                  editarIntervencion={
                    editarIntervencion
                  }
                />
              </Popup>
            </Polygon>
          )
        }

        if (
          intervencion.latitud &&
          intervencion.longitud
        ) {
          return (
            <Marker
              key={intervencion.id}
              position={[
                parseFloat(
                  intervencion.latitud
                ),
                parseFloat(
                  intervencion.longitud
                ),
              ]}
              icon={crearIconoColor(
                color,
                obtenerTamanoIcono(
                  intervencion
                )
              )}
              eventHandlers={obtenerEventos(
                intervencion
              )}
            >
              <Popup>
                <PopupIntervencion
                  intervencion={intervencion}
                  editarIntervencion={
                    editarIntervencion
                  }
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
