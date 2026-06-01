import { useState } from 'react'

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
  intervencionEnfocada,
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
  // En modo dibujo no abrimos popups de intervenciones,
  // porque el click del mapa debe interpretarse como dibujo.
  //
  // Cuando NO estamos dibujando:
  // 1. enfocamos la intervención
  // 2. esperamos un instante
  // 3. abrimos el popup
  //
  // Esto evita que MapFocus cierre el popup al mover el mapa.

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
    return hoverId === intervencion.id
  }

  function estaEnfocada(intervencion) {
    return idEnfocado === intervencion.id
  }

  function obtenerOpcionesLinea(
    intervencion,
    color
  ) {
    return {
      color,
      weight: estaEnfocada(intervencion)
        ? 10
        : estaEnHover(intervencion)
          ? 9
          : 7,
      opacity: estaEnfocada(intervencion)
        ? 1
        : estaEnHover(intervencion)
          ? 1
          : 0.92,
    }
  }

  function obtenerOpcionesPoligono(
    intervencion,
    color
  ) {
    return {
      color,
      weight: estaEnfocada(intervencion)
        ? 7
        : estaEnHover(intervencion)
          ? 6
          : 4,
      fillColor: color,
      fillOpacity: estaEnfocada(intervencion)
        ? 0.42
        : estaEnHover(intervencion)
          ? 0.38
          : 0.25,
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

        // ===============================
        // LÍNEA
        // ===============================

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

        // ===============================
        // POLÍGONO
        // ===============================

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

        // ===============================
        // PUNTO
        // ===============================

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
