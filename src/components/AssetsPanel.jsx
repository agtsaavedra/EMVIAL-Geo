function AssetsPanel({
  intervencionesFiltradas = [],
  editarIntervencion,
  eliminarIntervencion,
  enfocarIntervencion,
  abierto,
  setAbierto,
}) {
  // =====================================================
  // HELPERS
  // =====================================================

  function esPantallaChica() {
    return window.innerWidth <= 1024
  }

  function refrescarMapaLuegoDeAnimacion() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 320)
  }

  function alternarPanel() {
    setAbierto((prev) => !prev)
    refrescarMapaLuegoDeAnimacion()
  }

  function cerrarPanelMobile() {
    if (!esPantallaChica()) return

    setAbierto(false)
    refrescarMapaLuegoDeAnimacion()
  }

  function manejarClickCard(intervencion) {
    enfocarIntervencion?.(intervencion)
    cerrarPanelMobile()
  }

  function manejarEditar(e, intervencion) {
    e.stopPropagation()
    editarIntervencion(intervencion)
  }

  function manejarEliminar(e, intervencion) {
    e.stopPropagation()
    eliminarIntervencion(intervencion)
  }

  function obtenerIconoToggle() {
    if (esPantallaChica()) {
      return abierto ? '▾' : '▴'
    }

    return abierto ? '›' : '‹'
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <aside
      className={`assets-panel ${
        abierto ? 'open' : 'closed'
      }`}
    >
      {/* Botón para abrir/cerrar panel.
          En desktop funciona lateral.
          En mobile funciona como panel inferior. */}
      <button
        type="button"
        className="panel-toggle"
        onClick={alternarPanel}
      >
        {obtenerIconoToggle()}
      </button>

      {abierto && (
        <div className="panel">
          <h3>Intervenciones cargadas</h3>

          {intervencionesFiltradas.length === 0 ? (
            <p className="empty">
              Todavía no hay intervenciones cargadas.
            </p>
          ) : (
            intervencionesFiltradas.map(
              (intervencion) => (
                <div
                  key={intervencion.id}
                  className="card"
                  onClick={() =>
                    manejarClickCard(intervencion)
                  }
                >
                  {/* ===============================
                      CABECERA
                  ================================ */}

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
                        onClick={(e) =>
                          manejarEditar(
                            e,
                            intervencion
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={(e) =>
                          manejarEliminar(
                            e,
                            intervencion
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* ===============================
                      ESTADO
                  ================================ */}

                  <span>
                    {intervencion.estado}
                  </span>

                  {/* ===============================
                      DETALLE
                  ================================ */}

                  <p>
                    {intervencion.barrio && (
                      <>
                        <strong>Barrio:</strong>{' '}
                        {intervencion.barrio}
                        <br />
                      </>
                    )}

                    {(intervencion.ubicacion ||
                      intervencion.direccion) && (
                      <>
                        <strong>Referencia:</strong>{' '}
                        {intervencion.ubicacion ||
                          intervencion.direccion}
                        <br />
                      </>
                    )}

                    {intervencion.fuente && (
                      <>
                        <strong>Fuente:</strong>{' '}
                        {intervencion.fuente}
                      </>
                    )}
                  </p>

                  {/* ===============================
                      GEOMETRÍA / COORDENADAS
                  ================================ */}

                  <small>
                    {intervencion.geometriaTipo ||
                      'Punto'}{' '}
                    — {intervencion.latitud},{' '}
                    {intervencion.longitud}
                  </small>
                </div>
              )
            )
          )}
        </div>
      )}
    </aside>
  )
}

export default AssetsPanel
