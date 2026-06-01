function MapStatsPanel({
  abierto,
  cerrar,
  statsDetalle,
  statsPorObra,
  seleccionarBarrioEstadistica,
  assetsPanelAbierto,
}) {
  if (!abierto) return null

  return (
    <>
      <div
        className="map-stats-backdrop"
        onClick={cerrar}
      />

      <div
        className={`map-stats-panel ${
          assetsPanelAbierto
            ? 'with-assets-panel'
            : ''
        }`}
      >
        <div className="map-stats-panel-header">
          <div>
            <strong>
              Estadísticas del período
            </strong>

            <span>
              {statsDetalle.total}{' '}
              intervenciones cargadas
            </span>
          </div>

          <button
            className="close-btn"
            onClick={cerrar}
          >
            ×
          </button>
        </div>

        {/* ===================== */}
        {/* POR OBRA */}
        {/* ===================== */}

        <section className="map-stats-panel-section">
          <h4>POR OBRA</h4>

          {statsPorObra.map((item) => (
            <div
              key={item.obra}
              className="stats-detail-row"
            >
              <span>
                {item.obra}
              </span>

              <strong>
                {item.total}
              </strong>
            </div>
          ))}
        </section>

        {/* ===================== */}
        {/* POR BARRIO */}
        {/* ===================== */}

        <section className="map-stats-panel-section">
          <h4>POR BARRIO</h4>

          {statsDetalle.porBarrio.map(
            ([barrio, total]) => (
              <button
                key={barrio}
                className="stats-detail-row clickable"
                onClick={() =>
                  seleccionarBarrioEstadistica?.(
                    barrio
                  )
                }
              >
                <span>{barrio}</span>
                <strong>{total}</strong>
              </button>
            )
          )}
        </section>

        {/* ===================== */}
        {/* POR ESTADO */}
        {/* ===================== */}

        <section className="map-stats-panel-section">
          <h4>POR ESTADO</h4>

          {statsDetalle.porEstado.map(
            ([estado, total]) => (
              <div
                key={estado}
                className="stats-detail-row"
              >
                <span>{estado}</span>
                <strong>{total}</strong>
              </div>
            )
          )}
        </section>

        {/* ===================== */}
        {/* POR GEOMETRÍA */}
        {/* ===================== */}

        <section className="map-stats-panel-section">
          <h4>POR GEOMETRÍA</h4>

          {statsDetalle.porGeometria.map(
            ([geo, total]) => (
              <div
                key={geo}
                className="stats-detail-row"
              >
                <span>{geo}</span>
                <strong>{total}</strong>
              </div>
            )
          )}
        </section>
      </div>
    </>
  )
}

export default MapStatsPanel