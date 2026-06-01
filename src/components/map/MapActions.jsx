import { useState } from 'react'

import { obtenerColorIntervencion } from '@map/mapColors'
import { useMapStatsDetail } from '@hooks/map/useMapStatsDetail'

import MapStatsPanel from './MapStatsPanel'

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
  assetsPanelAbierto,
}) {
  // =====================================================
  // ESTADO LOCAL
  // =====================================================
  // Controla si está abierto el dashboard flotante
  // de estadísticas del mapa.

  const [statsAbiertas, setStatsAbiertas] =
    useState(false)

  // =====================================================
  // ESTADÍSTICAS DETALLADAS
  // =====================================================
  // useMapStatsDetail:
  // - total de intervenciones
  // - agrupado por barrio
  // - agrupado por estado
  // - agrupado por geometría

  const statsDetalle =
    useMapStatsDetail(intervenciones)

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="map-actions-wrapper">
      {/* ===============================
          ACCIONES PRINCIPALES DEL MAPA
      ================================ */}

      <div className="map-actions">
        <label className="layer-toggle external">
          <input
            type="checkbox"
            checked={mostrarBarrios}
            onChange={(e) =>
              setMostrarBarrios(e.target.checked)
            }
          />

          <span>Mostrar barrios</span>
        </label>

        <label className="layer-toggle external">
          <input
            type="checkbox"
            checked={modoDibujo}
            onChange={(e) =>
              setModoDibujo(e.target.checked)
            }
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

        {['Línea', 'Polígono'].includes(
          geometriaTipo
        ) && (
          <button
            type="button"
            className="map-action-btn"
            onClick={deshacerPunto}
            disabled={cantidadPuntos === 0}
          >
            ↶ Deshacer punto
          </button>
        )}
      </div>

      {/* ===============================
          ESTADÍSTICAS COMPACTAS
      ================================ */}

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
              const color =
                obtenerColorIntervencion({
                  obra: item.obra,
                })

              return (
                <div
                  key={item.obra}
                  className="map-stat-item"
                >
                  <span
                    className="map-stat-color"
                    style={{
                      backgroundColor: color,
                    }}
                  />

                  <strong>{item.obra}</strong>

                  <span>{item.total}</span>
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

      {/* ===============================
          DASHBOARD FLOTANTE
      ================================ */}

      <MapStatsPanel
        abierto={statsAbiertas}
        cerrar={() => setStatsAbiertas(false)}
        statsDetalle={statsDetalle}
        statsPorObra={statsPorObra}
        seleccionarBarrioEstadistica={
          seleccionarBarrioEstadistica
        }
        assetsPanelAbierto={assetsPanelAbierto}
      />
    </div>
  )
}

export default MapActions
