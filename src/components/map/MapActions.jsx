/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

import { useState } from 'react'

import { obtenerColorIntervencion } from '@map/config/mapColors'
import { useMapStatsDetail } from '@hooks/map/useMapStatsDetail'
import {
  normalizarGeometriaTipo,
} from '@domain/intervencion'

import MapStatsPanel from './MapStatsPanel'

// Punto de entrada visual del componente.
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
  modoConsulta,
  setModoConsulta,

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
  const geometriaNormalizada =
    normalizarGeometriaTipo(geometriaTipo)
  const permiteDeshacerPunto =
    geometriaNormalizada === 'Línea' ||
    geometriaNormalizada === 'Polígono'

  // =====================================================
  // RENDER
  // =====================================================

  // Render principal del componente.
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
            checked={modoConsulta}
            onChange={(e) =>
              setModoConsulta(e.target.checked)
            }
          />

          <span>Modo consulta</span>
        </label>

        <label className="layer-toggle external">
          <input
            type="checkbox"
            checked={modoDibujo}
            disabled={modoConsulta}
            onChange={(e) =>
              setModoDibujo(e.target.checked)
            }
          />

          <span>Modo dibujo</span>
        </label>

        {!modoConsulta && hayUbicacion && (
          <button
            type="button"
            className="map-action-btn"
            onClick={limpiarUbicacion}
          >
            × Limpiar ubicación
          </button>
        )}

        {permiteDeshacerPunto && (
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

