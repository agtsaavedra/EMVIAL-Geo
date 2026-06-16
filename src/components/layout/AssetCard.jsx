import {
  obtenerDetalleIntervencion,
  obtenerMetricasIntervencion,
  obtenerReferenciaIntervencion,
  obtenerSubtituloIntervencion,
  obtenerTituloIntervencion,
} from '@domain/intervencion'

const GRUPOS_DETALLE = [
  {
    titulo: 'Datos operativos',
    campos: new Set([
      'Nombre',
      'Mes',
      'Obra',
      'Tipo',
      'Inspector',
      'Realizo',
      'Fuente',
    ]),
  },
  {
    titulo: 'Ubicacion',
    campos: new Set([
      'Barrio',
      'Ubicacion',
      'Direccion',
      'Coordenadas',
      'Puntos de geometria',
    ]),
  },
  {
    titulo: 'Metricas',
    campos: new Set([
      'Cuadras',
      'Metros lineales',
      'Metros cuadrados',
    ]),
  },
  {
    titulo: 'Observaciones',
    campos: new Set(['Observaciones']),
  },
]

function agruparDetalle(detalle) {
  return GRUPOS_DETALLE
    .map((grupo) => ({
      titulo: grupo.titulo,
      filas: detalle.filter(([label]) =>
        grupo.campos.has(label)
      ),
    }))
    .filter((grupo) => grupo.filas.length > 0)
}

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
  onVerHistorial,
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
  const detalleAgrupado =
    agruparDetalle(detalle)

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
          <span className="card-location">
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
            inert={!detalleAbierto}
          >
            <div className="card-detail-inner">
              {detalleAgrupado.map((grupo) => (
                <section
                  key={`${intervencion.id}-${grupo.titulo}`}
                  className="card-detail-section"
                >
                  <h4>{grupo.titulo}</h4>

                  {grupo.filas.map(([label, valor]) => (
                    <div
                      key={`${intervencion.id}-${label}`}
                      className="card-detail-row"
                    >
                      <b>{label}</b>
                      <span>{valor}</span>
                    </div>
                  ))}
                </section>
              ))}

              <button
                type="button"
                className="card-history-btn"
                onClick={onVerHistorial}
              >
                Ver historial
              </button>
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
