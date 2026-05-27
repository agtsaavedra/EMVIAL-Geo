function AssetsPanel({
  intervencionesFiltradas = [],
  editarIntervencion,
  eliminarIntervencion,
}) {
  return (
    <div className="panel">
      <h3>Intervenciones cargadas</h3>

      {intervencionesFiltradas.length === 0 ? (
        <p className="empty">Todavía no hay intervenciones cargadas.</p>
      ) : (
        intervencionesFiltradas.map((intervencion) => (
          <div className="card" key={intervencion.id}>
            <div className="card-header">
              <div>
                <strong>
                  {intervencion.area} — {intervencion.tipoIntervencion}
                </strong>
                {intervencion.subtipo && (
                  <small className="card-subtitle">
                    {intervencion.subtipo}
                  </small>
                )}
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => editarIntervencion(intervencion)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => eliminarIntervencion(intervencion.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <span>{intervencion.estado}</span>

            <p>
              {intervencion.barrio && (
                <>
                  <strong>Barrio:</strong> {intervencion.barrio}
                  <br />
                </>
              )}

              {intervencion.direccion && (
                <>
                  <strong>Referencia:</strong> {intervencion.direccion}
                  <br />
                </>
              )}

              {intervencion.fecha && (
                <>
                  <strong>Fecha:</strong> {intervencion.fecha}
                  <br />
                </>
              )}

              {intervencion.cantidad && (
                <>
                  <strong>Cantidad:</strong> {intervencion.cantidad}{' '}
                  {intervencion.unidad}
                  <br />
                </>
              )}

              {intervencion.fuente && (
                <>
                  <strong>Fuente:</strong> {intervencion.fuente}
                </>
              )}
            </p>

            <small>
              {intervencion.geometriaTipo || 'Punto'} —{' '}
              {intervencion.latitud}, {intervencion.longitud}
            </small>
          </div>
        ))
      )}
    </div>
  )
}

export default AssetsPanel