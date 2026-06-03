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
  manejarEnfocarIntervencion,

  setIntervencionHoverId,

  assetsPanelAbierto,
  setAssetsPanelAbierto,
}) {
  return useMemo(
    () => ({
      intervencionesFiltradas,

      editarIntervencion:
        manejarEditarIntervencion,

      eliminarIntervencion:
        eliminarIntervencionProtegida,

      enfocarIntervencion:
        manejarEnfocarIntervencion,

      setIntervencionHoverId,

      abierto: assetsPanelAbierto,
      setAbierto: setAssetsPanelAbierto,
    }),
    [
      intervencionesFiltradas,
      manejarEditarIntervencion,
      eliminarIntervencionProtegida,
      manejarEnfocarIntervencion,
      setIntervencionHoverId,
      assetsPanelAbierto,
      setAssetsPanelAbierto,
    ]
  )
}