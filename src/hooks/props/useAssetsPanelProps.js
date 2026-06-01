export function useAssetsPanelProps({
  intervencionesFiltradas,

  manejarEditarIntervencion,
  eliminarIntervencionProtegida,
  manejarEnfocarIntervencion,

  setIntervencionHoverId,

  assetsPanelAbierto,
  setAssetsPanelAbierto,
}) {
  return {
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
  }
}
