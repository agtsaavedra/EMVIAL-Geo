/**
 * Hook adaptador de props para `MapView`.
 *
 * Centraliza el armado de props del mapa para mantener limpia la capa
 * orquestadora de la app.
 */

import { useMemo } from 'react'

// Punto de entrada público del hook.
export function useMapProps({
  form,
  setForm,

  intervencionesFiltradas,
  intervencionEditandoId,

  puntoSeleccionado,
  setPuntoSeleccionado,

  obtenerDireccion,

  barrioSeleccionado,
  setBarrioSeleccionado,

  mostrarBarrios,
  setMostrarBarrios,

  manejarEditarIntervencion,
  intervencionEnfocada,
  intervencionHoverId,

  modoDibujo,
  setModoDibujo,

  sidebarAbierto,
  manejarEnfocarIntervencion,

  assetsPanelAbierto,

  guideOverlay,
}) {
  return useMemo(
    () => ({
      form,
      setForm,

      intervencionesFiltradas,
      intervencionEditandoId,

      puntoSeleccionado,
      setPuntoSeleccionado,

      obtenerDireccion,

      barrioSeleccionado,
      setBarrioSeleccionado,

      mostrarBarrios,
      setMostrarBarrios,

      editarIntervencion:
        manejarEditarIntervencion,

      intervencionEnfocada,
      intervencionHoverId,

      modoDibujo,
      setModoDibujo,

      sidebarAbierto,

      enfocarIntervencion:
        manejarEnfocarIntervencion,

      assetsPanelAbierto,

      guideOverlay,
    }),
    [
      form,
      setForm,
      intervencionesFiltradas,
      intervencionEditandoId,
      puntoSeleccionado,
      setPuntoSeleccionado,
      obtenerDireccion,
      barrioSeleccionado,
      setBarrioSeleccionado,
      mostrarBarrios,
      setMostrarBarrios,
      manejarEditarIntervencion,
      intervencionEnfocada,
      intervencionHoverId,
      modoDibujo,
      setModoDibujo,
      sidebarAbierto,
      manejarEnfocarIntervencion,
      assetsPanelAbierto,
      guideOverlay,
    ]
  )
}