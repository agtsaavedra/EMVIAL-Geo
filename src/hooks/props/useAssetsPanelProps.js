/**
 * Hook adaptador de props para `AssetsPanel`.
 *
 * Traduce nombres internos del controlador de app a la API esperada por el
 * componente y memoiza el objeto resultante.
 */

import { useMemo } from 'react'

// Punto de entrada público del hook.
export function useAssetsPanelProps({
  intervencionesFiltradas,

  manejarEditarIntervencion,
  eliminarIntervencionProtegida,
  duplicarIntervencionProtegida,
  manejarEnfocarIntervencion,
  intervencionEnfocada,

  setIntervencionHoverId,

  assetsPanelAbierto,
  setAssetsPanelAbierto,
  modoConsulta,
}) {
  return useMemo(
    () => ({
      intervencionesFiltradas,

      editarIntervencion:
        manejarEditarIntervencion,

      eliminarIntervencion:
        eliminarIntervencionProtegida,
      duplicarIntervencion:
        duplicarIntervencionProtegida,

      enfocarIntervencion:
        manejarEnfocarIntervencion,

      intervencionEnfocada,

      setIntervencionHoverId,

      abierto: assetsPanelAbierto,
      setAbierto: setAssetsPanelAbierto,
      modoConsulta,
    }),
    [
      intervencionesFiltradas,
      manejarEditarIntervencion,
      eliminarIntervencionProtegida,
      duplicarIntervencionProtegida,
      manejarEnfocarIntervencion,
      intervencionEnfocada,
      setIntervencionHoverId,
      assetsPanelAbierto,
      setAssetsPanelAbierto,
      modoConsulta,
    ]
  )
}
