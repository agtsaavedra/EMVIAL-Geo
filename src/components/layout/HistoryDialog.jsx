import {
  describirEventoHistorial,
  formatearFechaHistorial,
  obtenerCambiosHistorial,
  obtenerTituloAccionHistorial,
} from '@services/historyFormatter'

function HistoryDialog({
  abierto,
  intervencion,
  historial = [],
  cargando,
  onCerrar,
}) {
  if (!abierto) return null

  return (
    <div
      className="confirm-overlay"
      onClick={onCerrar}
    >
      <div
        className="confirm-dialog history-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          <span className="confirm-icon">HC</span>

          <div>
            <h3>Historial de cambios</h3>
            <small>
              {intervencion?.nombre ||
                intervencion?.obra ||
                'Intervencion'}
            </small>
          </div>
        </div>

        <div className="history-list">
          {cargando && (
            <p className="empty">
              Cargando historial...
            </p>
          )}

          {!cargando && historial.length === 0 && (
            <p className="empty">
              Todavia no hay movimientos registrados.
            </p>
          )}

          {!cargando &&
            historial.map((evento) => {
              const cambios =
                obtenerCambiosHistorial(evento)

              return (
                <article
                  key={evento.id}
                  className="history-item"
                >
                  <div className="history-item-header">
                    <div>
                      <strong>
                        {obtenerTituloAccionHistorial(evento)}
                      </strong>
                      <small>
                        {describirEventoHistorial(evento)}
                      </small>
                    </div>
                    <span>
                      {formatearFechaHistorial(evento.fecha)}
                    </span>
                  </div>

                  {cambios.length > 0 && (
                    <div className="history-changes">
                      {cambios.map((cambio) => (
                        <div
                          key={`${evento.id}-${cambio.campo}`}
                          className="history-change"
                        >
                          <b>{cambio.etiqueta}</b>
                          <span>
                            <small>Antes</small>
                            {cambio.anterior}
                          </span>
                          <span>
                            <small>Despues</small>
                            {cambio.actual}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryDialog
