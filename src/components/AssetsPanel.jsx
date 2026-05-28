import { useState } from 'react'

function AssetsPanel({
  intervencionesFiltradas = [],
  editarIntervencion,
  eliminarIntervencion,
}) {
  const [abierto, setAbierto] = useState(true)

  return (
    <aside className={`assets-panel ${abierto ? 'open' : 'closed'}`}>
      <button
        type="button"
        className="panel-toggle"
        onClick={() => {
          setAbierto((prev) => !prev)

          setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
          }, 320)
        }}
      >
        {abierto ? '›' : '‹'}
      </button>

      {abierto && (
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
                      {intervencion.nombre ||
                        intervencion.obra ||
                        'Intervención'}
                    </strong>

                    {intervencion.obra && (
                      <small className="card-subtitle">
                        {intervencion.obra}
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

                  {(intervencion.ubicacion || intervencion.direccion) && (
                    <>
                      <strong>Referencia:</strong>{' '}
                      {intervencion.ubicacion || intervencion.direccion}
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
      )}
    </aside>
  )
}

export default AssetsPanel