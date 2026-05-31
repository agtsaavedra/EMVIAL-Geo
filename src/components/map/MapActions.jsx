import { useMemo, useState } from 'react'
import { obtenerColorIntervencion } from '../../map/mapColors'

function MapActions({
  mostrarBarrios,
  setMostrarBarrios,
  geometriaTipo,
  cantidadPuntos,
  deshacerPunto,
  limpiarUbicacion,
  statsPorObra = [],
  hayUbicacion,
  modoDibujo,
  setModoDibujo,
  intervenciones = [],
  seleccionarBarrioEstadistica,
}) {
  const [statsAbiertas, setStatsAbiertas] = useState(false)

  const statsDetalle = useMemo(() => {
    const total = intervenciones.length
    const porEstado = {}
    const porGeometria = {}
    const porBarrio = {}

    intervenciones.forEach((intervencion) => {
      const estado = intervencion.estado || 'Sin estado'
      const geometria = intervencion.geometriaTipo || 'Sin geometría'
      const barrio = intervencion.barrio || 'Sin barrio'

      porEstado[estado] = (porEstado[estado] || 0) + 1
      porGeometria[geometria] = (porGeometria[geometria] || 0) + 1
      porBarrio[barrio] = (porBarrio[barrio] || 0) + 1
    })

    return {
      total,
      porEstado: Object.entries(porEstado),
      porGeometria: Object.entries(porGeometria),
      porBarrio: Object.entries(porBarrio).sort((a, b) => b[1] - a[1]),
    }
  }, [intervenciones])

  function manejarClickBarrio(barrio) {
    if (barrio === 'Sin barrio') return

    seleccionarBarrioEstadistica?.(barrio)
    setStatsAbiertas(false)
  }

  return (
    <div className="map-actions-wrapper">
      <div className="map-actions">
        <label className="layer-toggle external">
          <input
            type="checkbox"
            checked={mostrarBarrios}
            onChange={(e) => setMostrarBarrios(e.target.checked)}
          />
          <span>Mostrar barrios</span>
        </label>

        <label className="layer-toggle external">
          <input
            type="checkbox"
            checked={modoDibujo}
            onChange={(e) => setModoDibujo(e.target.checked)}
          />
          <span>Modo dibujo</span>
        </label>

        {hayUbicacion && (
          <button
            type="button"
            className="map-action-btn"
            onClick={limpiarUbicacion}
          >
            × Limpiar ubicación
          </button>
        )}

        {['Línea', 'Polígono'].includes(geometriaTipo) && (
          <>
            <button
              type="button"
              className="map-action-btn"
              onClick={deshacerPunto}
            >
              ↶ Deshacer punto
            </button>

            <span className="map-action-info">
              Puntos marcados: {cantidadPuntos || 0}
            </span>
          </>
        )}
      </div>

      {statsPorObra.length > 0 && (
        <div className="map-stats-row">
          <div
            className={`map-stats ${
              statsPorObra.length >= 6
                ? 'compact'
                : statsPorObra.length >= 4
                  ? 'medium'
                  : ''
            }`}
          >
            {statsPorObra.map((item) => {
              const color = obtenerColorIntervencion({ obra: item.obra })

              return (
                <div key={item.obra} className="map-stat-item">
                  <span
                    className="map-stat-color"
                    style={{ backgroundColor: color }}
                  />
                  <strong>{item.obra}</strong> {item.total}
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="map-stats-open-btn"
            onClick={() => setStatsAbiertas(true)}
          >
            Ver estadísticas
          </button>
        </div>
      )}

      {statsAbiertas && (
        <div
          className="map-stats-backdrop"
          onClick={() => setStatsAbiertas(false)}
        >
          <div
            className="map-stats-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="map-stats-panel-header">
              <div>
                <strong>Estadísticas del período</strong>
                <span>{statsDetalle.total} intervenciones cargadas</span>
              </div>

              <button
                type="button"
                onClick={() => setStatsAbiertas(false)}
              >
                ×
              </button>
            </div>

            <div className="map-stats-panel-section">
              <h4>Por obra</h4>

              {statsPorObra.map((item) => {
                const color = obtenerColorIntervencion({ obra: item.obra })

                return (
                  <div key={item.obra} className="stats-detail-row">
                    <span>
                      <i style={{ backgroundColor: color }} />
                      {item.obra}
                    </span>
                    <strong>{item.total}</strong>
                  </div>
                )
              })}
            </div>

            <div className="map-stats-panel-section">
              <h4>Por barrio</h4>

              {statsDetalle.porBarrio.map(([barrio, total]) => (
                <button
                  key={barrio}
                  type="button"
                  className="stats-detail-row stats-detail-row-button"
                  onClick={() => manejarClickBarrio(barrio)}
                >
                  <span>{barrio}</span>
                  <strong>{total}</strong>
                </button>
              ))}
            </div>

            <div className="map-stats-panel-section">
              <h4>Por estado</h4>

              {statsDetalle.porEstado.map(([estado, total]) => (
                <div key={estado} className="stats-detail-row">
                  <span>{estado}</span>
                  <strong>{total}</strong>
                </div>
              ))}
            </div>

            <div className="map-stats-panel-section">
              <h4>Por geometría</h4>

              {statsDetalle.porGeometria.map(([geometria, total]) => (
                <div key={geometria} className="stats-detail-row">
                  <span>{geometria}</span>
                  <strong>{total}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapActions