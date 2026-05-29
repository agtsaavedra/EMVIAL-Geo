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
}) {
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
        <div
          className={`map-stats ${statsPorObra.length >= 6
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

                {item.lineas > 0 && <> · {item.lineas} L</>}
                {item.puntos > 0 && <> · {item.puntos} P</>}
                {item.poligonos > 0 && <> · {item.poligonos} G</>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MapActions