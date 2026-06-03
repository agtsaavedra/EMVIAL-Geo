import { useMemo } from 'react'

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