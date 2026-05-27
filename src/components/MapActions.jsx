function MapActions({
  mostrarBarrios,
  setMostrarBarrios,
  geometriaTipo,
  cantidadPuntos,
  deshacerPunto,
  limpiarGeometria,
}) {
  return (
    <div className="map-actions">
      <label className="layer-toggle external">
        <input
          type="checkbox"
          checked={mostrarBarrios}
          onChange={(e) => setMostrarBarrios(e.target.checked)}
        />
        <span>Mostrar barrios</span>
      </label>

      {['Línea', 'Polígono'].includes(geometriaTipo) && (
        <>
          <button
            type="button"
            className="map-action-btn"
            onClick={deshacerPunto}
          >
            ↶ Deshacer punto
          </button>

          <button
            type="button"
            className="map-action-btn danger"
            onClick={limpiarGeometria}
          >
            🗑 Limpiar geometría
          </button>

          <span className="map-action-info">
            Puntos marcados: {cantidadPuntos || 0}
          </span>
        </>
      )}
    </div>
  )
}

export default MapActions