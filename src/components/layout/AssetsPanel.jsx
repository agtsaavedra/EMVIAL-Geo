import {
  memo,
  useEffect,
  useRef,
} from 'react'

function AssetsPanel({
  intervencionesFiltradas = [],
  editarIntervencion,
  eliminarIntervencion,
  enfocarIntervencion,
  intervencionEnfocada,
  setIntervencionHoverId,
  abierto,
  setAbierto,
  modoConsulta,
}) {
  const panelRef = useRef(null)
  const cardRefs = useRef(new Map())
  const focusKeyProcesadoRef = useRef(null)
  const abiertoRef = useRef(abierto)

  useEffect(() => {
    abiertoRef.current = abierto
  }, [abierto])

  useEffect(() => {
    if (!intervencionEnfocada?.id) return

    const focusKey =
      intervencionEnfocada.__focusKey ||
      intervencionEnfocada.id

    if (
      focusKeyProcesadoRef.current ===
      focusKey
    ) {
      return
    }

    focusKeyProcesadoRef.current = focusKey
    const estaAbierto =
      abiertoRef.current

    if (!estaAbierto) return

    window.setTimeout(() => {
      const card =
        cardRefs.current.get(
          intervencionEnfocada.id
        )

      if (!card) return

      card.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 40)
  }, [
    intervencionEnfocada?.id,
    intervencionEnfocada?.__focusKey,
    intervencionesFiltradas,
    setAbierto,
  ])

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0
    }
  }, [intervencionesFiltradas.length])

  function esPantallaChica() {
    return window.innerWidth <= 1024
  }

  function alternarPanel() {
    setAbierto((prev) => !prev)
  }

  function cerrarPanelMobile() {
    if (!esPantallaChica()) return

    setAbierto(false)
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
    if (modoConsulta) return
    editarIntervencion(intervencion)
  }

  function manejarEliminar(e, intervencion) {
    e.stopPropagation()
    if (modoConsulta) return
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

  function formatearNumero(valor) {
    const numero = Number(valor)

    if (!Number.isFinite(numero)) {
      return null
    }

    return new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 2,
    }).format(numero)
  }

  function obtenerMetricas(intervencion) {
    const metricas = []
    const metrosLineales =
      formatearNumero(
        intervencion.metrosLineales
      )
    const metrosCuadrados =
      formatearNumero(
        intervencion.metrosCuadrados
      )
    const cuadras =
      formatearNumero(
        intervencion.cuadras
      )

    if (metrosLineales) {
      metricas.push({
        label: 'm lineales',
        value: metrosLineales,
      })
    }

    if (metrosCuadrados) {
      metricas.push({
        label: 'm2',
        value: metrosCuadrados,
      })
    }

    if (cuadras) {
      metricas.push({
        label: 'cuadras',
        value: cuadras,
      })
    }

    metricas.push({
      label: 'geom.',
      value:
        intervencion.geometriaTipo ||
        'Punto',
    })

    return metricas
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

      <div
        ref={panelRef}
        className="panel"
        aria-hidden={!abierto}
      >
        <h3>Intervenciones cargadas</h3>

        {intervencionesFiltradas.length === 0 ? (
          <p className="empty">
            Todavia no hay intervenciones cargadas.
          </p>
        ) : (
          <div
            className="virtual-card-list"
          >
            {intervencionesFiltradas.map(
            (intervencion) => {
              const referencia =
                obtenerReferencia(intervencion)
              const metricas =
                obtenerMetricas(intervencion)

              return (
                <div
                  key={intervencion.id}
                  ref={(elemento) => {
                    if (elemento) {
                      cardRefs.current.set(
                        intervencion.id,
                        elemento
                      )
                    } else {
                      cardRefs.current.delete(
                        intervencion.id
                      )
                    }
                  }}
                  className={`card ${
                    intervencionEnfocada?.id ===
                    intervencion.id
                      ? 'card-focused'
                      : ''
                  }`}
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
                  </div>

                  <div className="card-metrics">
                    {metricas.map((metrica) => (
                      <span
                        key={`${intervencion.id}-${metrica.label}`}
                        className="card-metric"
                      >
                        <strong>
                          {metrica.value}
                        </strong>
                        <small>
                          {metrica.label}
                        </small>
                      </span>
                    ))}
                  </div>

                  <div className="card-compact-detail">
                    {intervencion.barrio && (
                      <span>
                        <b>Barrio</b>{' '}
                        {intervencion.barrio}
                      </span>
                    )}

                    {referencia && (
                      <span>
                        <b>Ubicacion</b>{' '}
                        {referencia}
                      </span>
                    )}

                    {intervencion.fuente && (
                      <span>
                        <b>Fuente</b>{' '}
                        {intervencion.fuente}
                      </span>
                    )}
                  </div>

                  {!modoConsulta && (
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
                  )}
                </div>
              )
            }
          )}
          </div>
        )}
      </div>
    </aside>
  )
}

export default memo(AssetsPanel)
