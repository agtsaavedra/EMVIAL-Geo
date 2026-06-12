/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

import { formatearNumeroPeriodo } from '@services/periodoStats'

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

  function numero(valor, decimales = 0) {
    return formatearNumeroPeriodo(valor, decimales)
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
              {statsDetalle.total}
            </strong>
            <span>Intervenciones</span>
          </div>

          <div>
            <strong>
              {numero(
                statsDetalle.metrosLinealesTotal,
                1
              )}
            </strong>
            <span>Metros lineales</span>
          </div>

          <div>
            <strong>
              {numero(
                statsDetalle.metrosCuadradosTotal,
                1
              )}
            </strong>
            <span>Metros cuadrados</span>
          </div>

          <div>
            <strong>
              {numero(
                statsDetalle.cuadrasTotal,
                1
              )}
            </strong>
            <span>Cuadras</span>
          </div>

          <div>
            <strong>
              {statsDetalle.porBarrio.length}
            </strong>
            <span>Barrios</span>
          </div>

          <div>
            <strong>
              {statsPorObra.length}
            </strong>
            <span>Tipos de obra</span>
          </div>
        </div>

        <section className="map-stats-panel-section map-stats-panel-insights">
          <h4>Indicadores</h4>

          <div className="stats-insight-grid">
            <div>
              <span>Con geometria</span>
              <strong>
                {statsDetalle.conGeometria}
              </strong>
            </div>

            <div>
              <span>Sin metricas</span>
              <strong>
                {statsDetalle.sinMetricas}
              </strong>
            </div>
          </div>
        </section>

        {/* ===============================
            POR OBRA
        ================================ */}

        <section className="map-stats-panel-section">
          <h4>Por obra</h4>

          {statsDetalle.porObra.map((item) => (
            <div
              key={item.nombre}
              className="stats-detail-row stats-detail-row-metric"
            >
              <span>{item.nombre}</span>

              <div className="stats-detail-metrics">
                <strong>{item.total}</strong>
                <small>
                  {numero(item.metrosLineales, 1)} ml
                  {' / '}
                  {numero(item.metrosCuadrados, 1)} m2
                </small>
              </div>
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

