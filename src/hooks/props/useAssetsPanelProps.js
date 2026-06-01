export function useAssetsPanelProps({
  intervencionesFiltradas,

  manejarEditarIntervencion,
  eliminarIntervencionProtegida,
  manejarEnfocarIntervencion,

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

    abierto: assetsPanelAbierto,
    setAbierto: setAssetsPanelAbierto,
  }
}