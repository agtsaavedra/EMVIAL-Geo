import { memo } from 'react'

function AssetsPanel({
  intervencionesFiltradas = [],
  editarIntervencion,
  eliminarIntervencion,
  enfocarIntervencion,
  setIntervencionHoverId,
  abierto,
  setAbierto,
}) {
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

  function manejarHoverCard(intervencion) {
    setIntervencionHoverId?.(
      intervencion?.id || null
    )
  }

  function limpiarHoverCard() {
    setIntervencionHoverId?.(null)
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
      return abierto ? 'v' : '^'
    }

    return abierto ? '>' : '<'
  }

  function obtenerTitulo(intervencion) {
    return (
      intervencion.nombre ||
      intervencion.obra ||
      'Intervencion'
    )
  }

  function obtenerReferencia(intervencion) {
    return (
      intervencion.ubicacion ||
      intervencion.direccion ||
      ''
    )
  }

  return (
    <aside
      className={`assets-panel ${
        abierto ? 'open' : 'closed'
      }`}
    >
      <button
        type="button"
        className="panel-toggle"
        onClick={alternarPanel}
        title={
          abierto
            ? 'Ocultar intervenciones'
            : 'Mostrar intervenciones'
        }
        aria-label={
          abierto
            ? 'Ocultar intervenciones'
            : 'Mostrar intervenciones'
        }
      >
        <span className="toggle-icon">
          {obtenerIconoToggle()}
        </span>
        <span className="toggle-label">
          Lista
        </span>
      </button>

      {abierto && (
        <div className="panel">
          <h3>Intervenciones cargadas</h3>

          {intervencionesFiltradas.length === 0 ? (
            <p className="empty">
              Todavia no hay intervenciones cargadas.
            </p>
          ) : (
            intervencionesFiltradas.map(
              (intervencion) => {
                const referencia =
                  obtenerReferencia(intervencion)

                return (
                  <div
                    key={intervencion.id}
                    className="card"
                    onClick={() =>
                      manejarClickCard(intervencion)
                    }
                    onMouseEnter={() =>
                      manejarHoverCard(intervencion)
                    }
                    onMouseLeave={limpiarHoverCard}
                  >
                    <div className="card-header">
                      <div>
                        <strong>
                          {obtenerTitulo(intervencion)}
                        </strong>

                        <small className="card-subtitle">
                          {intervencion.obra ||
                            'Sin obra'}{' '}
                          /{' '}
                          {intervencion.estado ||
                            'Sin estado'}
                        </small>
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

                    <div className="card-compact-detail">
                      {intervencion.barrio && (
                        <span>
                          Barrio: {intervencion.barrio}
                        </span>
                      )}

                      {referencia && (
                        <span>
                          Ubicacion: {referencia}
                        </span>
                      )}

                      {intervencion.fuente && (
                        <span>
                          Fuente: {intervencion.fuente}
                        </span>
                      )}
                    </div>

                    <small className="card-geometry">
                      {intervencion.geometriaTipo ||
                        'Punto'}{' '}
                      - {intervencion.latitud},{' '}
                      {intervencion.longitud}
                    </small>
                  </div>
                )
              }
            )
          )}
        </div>
      )}
    </aside>
  )
}

export default memo(AssetsPanel)
