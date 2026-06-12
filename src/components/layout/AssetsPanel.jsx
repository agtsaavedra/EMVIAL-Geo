import {
  memo,
  useEffect,
  useRef,
  useState,
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
  const [detalleAbiertoId, setDetalleAbiertoId] =
    useState(null)

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

  function alternarDetalle(e, intervencionId) {
    e.stopPropagation()

    setDetalleAbiertoId((actual) =>
      actual === intervencionId
        ? null
        : intervencionId
    )
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

  function obtenerSubtitulo(intervencion) {
    const partes = []

    if (
      intervencion.nombre &&
      intervencion.obra
    ) {
      partes.push(intervencion.obra)
    }

    if (intervencion.geometriaTipo) {
      partes.push(
        intervencion.geometriaTipo
      )
    }

    return partes.join(' / ')
  }

  function obtenerNumeroPositivo(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return null
    }

    const numero = Number(valor)

    if (
      !Number.isFinite(numero) ||
      numero <= 0
    ) {
      return null
    }

    return numero
  }

  function formatearNumero(valor) {
    return new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 2,
    }).format(valor)
  }

  function obtenerMetricas(intervencion) {
    const metricas = []
    const geometriaTipo =
      intervencion.geometriaTipo ||
      'Punto'

    if (geometriaTipo === 'Punto') {
      return metricas
    }

    const metrosLineales =
      obtenerNumeroPositivo(
        intervencion.metrosLineales
      )
    const metrosCuadrados =
      obtenerNumeroPositivo(
        intervencion.metrosCuadrados
      )
    const cuadras =
      obtenerNumeroPositivo(
        intervencion.cuadras
      )

    if (
      geometriaTipo === 'Línea' &&
      metrosLineales
    ) {
      metricas.push({
        label: 'm lineales',
        value:
          formatearNumero(metrosLineales),
      })
    }

    if (
      geometriaTipo === 'Polígono' &&
      metrosCuadrados
    ) {
      metricas.push({
        label: 'm2',
        value:
          formatearNumero(metrosCuadrados),
      })
    }

    if (
      geometriaTipo === 'Línea' &&
      cuadras
    ) {
      metricas.push({
        label: 'cuadras',
        value: formatearNumero(cuadras),
      })
    }

    return metricas
  }

  function obtenerDetalle(
    intervencion,
    { referencia, metricas }
  ) {
    const coordenadas =
      intervencion.latitud &&
      intervencion.longitud
        ? `${intervencion.latitud}, ${intervencion.longitud}`
        : ''

    const cantidadPuntos =
      Array.isArray(intervencion.geometria)
        ? intervencion.geometria.length
        : 0
    const camposVisibles =
      new Set(['Tipo'])

    if (intervencion.nombre) {
      camposVisibles.add('Nombre')
    } else if (intervencion.obra) {
      camposVisibles.add('Obra')
    }

    if (
      intervencion.nombre &&
      intervencion.obra
    ) {
      camposVisibles.add('Obra')
    }

    if (intervencion.barrio) {
      camposVisibles.add('Barrio')
    }

    if (intervencion.fuente) {
      camposVisibles.add('Fuente')
    }

    if (
      referencia &&
      referencia === intervencion.ubicacion
    ) {
      camposVisibles.add('Ubicacion')
    }

    if (
      referencia &&
      referencia === intervencion.direccion
    ) {
      camposVisibles.add('Direccion')
    }

    metricas.forEach((metrica) => {
      if (metrica.label === 'cuadras') {
        camposVisibles.add('Cuadras')
      }

      if (metrica.label === 'm lineales') {
        camposVisibles.add(
          'Metros lineales'
        )
      }

      if (metrica.label === 'm2') {
        camposVisibles.add(
          'Metros cuadrados'
        )
      }
    })

    return [
      ['Nombre', intervencion.nombre],
      ['Mes', intervencion.mesTerminacion],
      ['Obra', intervencion.obra],
      ['Tipo', intervencion.geometriaTipo],
      ['Barrio', intervencion.barrio],
      ['Ubicacion', intervencion.ubicacion],
      ['Direccion', intervencion.direccion],
      ['Fuente', intervencion.fuente],
      ['Inspector', intervencion.inspector],
      ['Realizo', intervencion.realizo],
      ['Cuadras', intervencion.cuadras],
      [
        'Metros lineales',
        intervencion.metrosLineales,
      ],
      [
        'Metros cuadrados',
        intervencion.metrosCuadrados,
      ],
      ['Coordenadas', coordenadas],
      [
        'Puntos de geometria',
        cantidadPuntos
          ? String(cantidadPuntos)
          : '',
      ],
      [
        'Observaciones',
        intervencion.descripcion,
      ],
    ].filter(([label, valor]) => {
      if (camposVisibles.has(label)) {
        return false
      }

      if (
        valor === null ||
        valor === undefined
      ) {
        return false
      }

      return String(valor).trim() !== ''
    })
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
              const subtitulo =
                obtenerSubtitulo(intervencion)
              const metricas =
                obtenerMetricas(intervencion)
              const detalle =
                obtenerDetalle(intervencion, {
                  referencia,
                  metricas,
                })
              const detalleAbierto =
                detalleAbiertoId ===
                intervencion.id

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
                  } ${
                    detalleAbierto
                      ? 'card-expanded'
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
                          <strong>
                            {metrica.value}
                          </strong>
                          <small>
                            {metrica.label}
                          </small>
                        </span>
                      ))}
                    </div>
                  )}

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

                  {detalle.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="card-detail-toggle"
                        onClick={(e) =>
                          alternarDetalle(
                            e,
                            intervencion.id
                          )
                        }
                        aria-expanded={
                          detalleAbierto
                        }
                      >
                        {detalleAbierto
                          ? 'Ocultar detalle'
                          : 'Ver detalle'}
                      </button>

                      <div
                        className="card-detail"
                        aria-hidden={
                          !detalleAbierto
                        }
                      >
                        <div className="card-detail-inner">
                          {detalle.map(
                            ([label, valor]) => (
                              <div
                                key={`${intervencion.id}-${label}`}
                                className="card-detail-row"
                              >
                                <b>{label}</b>
                                <span>{valor}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

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
