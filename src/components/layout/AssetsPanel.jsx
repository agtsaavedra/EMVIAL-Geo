import {
  memo,
  useEffect,
  useRef,
  useState,
} from 'react'

import AssetCard from './AssetCard'

function AssetsPanel({
  intervencionesFiltradas = [],
  editarIntervencion,
  eliminarIntervencion,
  duplicarIntervencion,
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
  const [historialPorId, setHistorialPorId] =
    useState({})

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

    if (!abiertoRef.current) return

    window.setTimeout(() => {
      const card =
        cardRefs.current.get(
          intervencionEnfocada.id
        )

      card?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 40)
  }, [
    intervencionEnfocada?.id,
    intervencionEnfocada?.__focusKey,
    intervencionesFiltradas,
  ])

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0
    }
  }, [intervencionesFiltradas.length])

  function esPantallaChica() {
    return window.innerWidth <= 1024
  }

  function cerrarPanelMobile() {
    if (esPantallaChica()) {
      setAbierto(false)
    }
  }

  function obtenerIconoToggle() {
    if (esPantallaChica()) {
      return abierto ? 'v' : '^'
    }

    return abierto ? '>' : '<'
  }

  function alternarDetalle(e, intervencionId) {
    e.stopPropagation()

    setDetalleAbiertoId((actual) =>
      actual === intervencionId
        ? null
        : intervencionId
    )

    if (
      !historialPorId[intervencionId] &&
      window.api?.obtenerHistorialIntervencion
    ) {
      window.api
        .obtenerHistorialIntervencion(
          intervencionId
        )
        .then((historial) => {
          setHistorialPorId((actual) => ({
            ...actual,
            [intervencionId]: historial || [],
          }))
        })
        .catch(() => {
          setHistorialPorId((actual) => ({
            ...actual,
            [intervencionId]: [],
          }))
        })
    }
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

  function setCardRef(intervencionId, elemento) {
    if (elemento) {
      cardRefs.current.set(
        intervencionId,
        elemento
      )
      return
    }

    cardRefs.current.delete(intervencionId)
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
        onClick={() =>
          setAbierto((prev) => !prev)
        }
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
        <h3>
          Intervenciones cargadas
          <span className="panel-count">
            {intervencionesFiltradas.length}
          </span>
        </h3>

        {intervencionesFiltradas.length === 0 ? (
          <p className="empty">
            Todavia no hay intervenciones cargadas.
          </p>
        ) : (
          <div className="virtual-card-list">
            {intervencionesFiltradas.map(
              (intervencion) => (
                <AssetCard
                  key={intervencion.id}
                  intervencion={intervencion}
                  enfocado={
                    intervencionEnfocada?.id ===
                    intervencion.id
                  }
                  detalleAbierto={
                    detalleAbiertoId ===
                    intervencion.id
                  }
                  modoConsulta={modoConsulta}
                  setCardRef={(elemento) =>
                    setCardRef(
                      intervencion.id,
                      elemento
                    )
                  }
                  onClick={() => {
                    enfocarIntervencion?.(
                      intervencion
                    )
                    cerrarPanelMobile()
                  }}
                  onHover={() =>
                    setIntervencionHoverId?.(
                      intervencion.id
                    )
                  }
                  onLeave={() =>
                    setIntervencionHoverId?.(null)
                  }
                  onToggleDetalle={(e) =>
                    alternarDetalle(
                      e,
                      intervencion.id
                    )
                  }
                  historial={
                    historialPorId[
                      intervencion.id
                    ]
                  }
                  onEditar={(e) =>
                    manejarEditar(e, intervencion)
                  }
                  onDuplicar={(e) => {
                    e.stopPropagation()
                    if (!modoConsulta) {
                      duplicarIntervencion?.(
                        intervencion
                      )
                    }
                  }}
                  onEliminar={(e) =>
                    manejarEliminar(e, intervencion)
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

export default memo(AssetsPanel)
