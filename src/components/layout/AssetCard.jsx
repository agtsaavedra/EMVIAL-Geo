import {
  obtenerDetalleIntervencion,
  obtenerMetricasIntervencion,
  obtenerReferenciaIntervencion,
  obtenerSubtituloIntervencion,
  obtenerTituloIntervencion,
} from '@domain/intervencion'

function AssetCard({
  intervencion,
  enfocado,
  detalleAbierto,
  modoConsulta,
  onClick,
  onHover,
  onLeave,
  onToggleDetalle,
  onEditar,
  onDuplicar,
  onEliminar,
  historial,
  setCardRef,
}) {
  const referencia =
    obtenerReferenciaIntervencion(intervencion)
  const subtitulo =
    obtenerSubtituloIntervencion(intervencion)
  const metricas =
    obtenerMetricasIntervencion(intervencion)
  const detalle =
    obtenerDetalleIntervencion(intervencion, {
      referencia,
      metricas,
    })

  return (
    <div
      ref={setCardRef}
      className={`card ${
        enfocado ? 'card-focused' : ''
      } ${detalleAbierto ? 'card-expanded' : ''}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="card-header">
        <div>
          <strong>
            {obtenerTituloIntervencion(intervencion)}
          </strong>

          {subtitulo && (
            <small className="card-subtitle">
              {subtitulo}
            </small>
          )}
        </div>
      </div>

      {metricas.length > 0 && (
        <div className="card-metrics">
          {metricas.map((metrica) => (
            <span
              key={`${intervencion.id}-${metrica.label}`}
              className="card-metric"
            >
              <strong>{metrica.value}</strong>
              <small>{metrica.label}</small>
            </span>
          ))}
        </div>
      )}

      <div className="card-compact-detail">
        {intervencion.barrio && (
          <span>
            <b>Barrio</b> {intervencion.barrio}
          </span>
        )}

        {referencia && (
          <span>
            <b>Ubicacion</b> {referencia}
          </span>
        )}

        {intervencion.fuente && (
          <span>
            <b>Fuente</b> {intervencion.fuente}
          </span>
        )}
      </div>

      {detalle.length > 0 && (
        <>
          <button
            type="button"
            className="card-detail-toggle"
            onClick={onToggleDetalle}
            aria-expanded={detalleAbierto}
          >
            {detalleAbierto
              ? 'Ocultar detalle'
              : 'Ver detalle'}
          </button>

          <div
            className="card-detail"
            aria-hidden={!detalleAbierto}
          >
            <div className="card-detail-inner">
              {detalle.map(([label, valor]) => (
                <div
                  key={`${intervencion.id}-${label}`}
                  className="card-detail-row"
                >
                  <b>{label}</b>
                  <span>{valor}</span>
                </div>
              ))}

              {historial?.length > 0 && (
                <div className="card-history">
                  <b>Historial</b>
                  {historial.slice(0, 3).map((evento) => (
                    <span key={evento.id}>
                      {evento.accion} - {new Date(evento.fecha).toLocaleString('es-AR')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!modoConsulta && (
        <div className="card-actions card-actions-three">
          <button
            type="button"
            className="edit-btn"
            onClick={onEditar}
          >
            Editar
          </button>

          <button
            type="button"
            className="duplicate-btn"
            onClick={onDuplicar}
          >
            Duplicar
          </button>

          <button
            type="button"
            className="delete-btn"
            onClick={onEliminar}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

export default AssetCard
