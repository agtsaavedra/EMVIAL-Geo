/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

// Punto de entrada visual del componente.
function MapStatsPanel({
  abierto,
  cerrar,
  statsDetalle,
  statsPorObra,
  seleccionarBarrioEstadistica,
  assetsPanelAbierto,
}) {
  // =====================================================
  // RENDER CONDICIONAL
  // =====================================================
  // Si el panel no está abierto, no renderizamos nada.
  // Esto evita capas invisibles interceptando clicks.

  if (!abierto) return null

  // =====================================================
  // ACCIONES
  // =====================================================

  function manejarClickBarrio(barrio) {
    if (barrio === 'Sin barrio') return

    seleccionarBarrioEstadistica?.(barrio)
    cerrar()
  }

  // =====================================================
  // RENDER
  // =====================================================

  // Render principal del componente.
  return (
    <>
      {/* Backdrop transparente/oscuro según CSS.
          Permite cerrar el dashboard haciendo click afuera. */}
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
        {/* ===============================
            HEADER
        ================================ */}

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
            type="button"
            className="close-btn"
            onClick={cerrar}
            title="Cerrar estadísticas"
          >
            ×
          </button>
        </div>

        <div className="map-stats-panel-summary">
          <div>
            <strong>
              {statsPorObra.length}
            </strong>
            <span>Tipos de obra</span>
          </div>

          <div>
            <strong>
              {statsDetalle.porBarrio.length}
            </strong>
            <span>Barrios</span>
          </div>

          <div>
            <strong>
              {statsDetalle.porEstado.length}
            </strong>
            <span>Estados</span>
          </div>
        </div>

        {/* ===============================
            POR OBRA
        ================================ */}

        <section className="map-stats-panel-section">
          <h4>Por obra</h4>

          {statsPorObra.map((item) => (
            <div
              key={item.obra}
              className="stats-detail-row"
            >
              <span>{item.obra}</span>
              <strong>{item.total}</strong>
            </div>
          ))}
        </section>

        {/* ===============================
            POR BARRIO
        ================================ */}

        <section className="map-stats-panel-section">
          <h4>Por barrio</h4>

          {statsDetalle.porBarrio.map(
            ([barrio, total]) => (
              <button
                key={barrio}
                type="button"
                className="stats-detail-row stats-detail-row-button"
                onClick={() =>
                  manejarClickBarrio(barrio)
                }
                disabled={barrio === 'Sin barrio'}
                title={
                  barrio === 'Sin barrio'
                    ? 'Intervenciones sin barrio asignado'
                    : `Ver barrio ${barrio}`
                }
              >
                <span>{barrio}</span>
                <strong>{total}</strong>
              </button>
            )
          )}
        </section>

        {/* ===============================
            POR ESTADO
        ================================ */}

        <section className="map-stats-panel-section">
          <h4>Por estado</h4>

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

        {/* ===============================
            POR GEOMETRÍA
        ================================ */}

        <section className="map-stats-panel-section">
          <h4>Por geometría</h4>

          {statsDetalle.porGeometria.map(
            ([geometria, total]) => (
              <div
                key={geometria}
                className="stats-detail-row"
              >
                <span>{geometria}</span>
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

