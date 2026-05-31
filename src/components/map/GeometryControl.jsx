const OPCIONES = [
  {
    tipo: 'Punto',
    icono: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="10"
          r="2.3"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    tipo: 'Línea',
    icono: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 17L9 8l6 7 5-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="17" r="2" fill="currentColor" />
        <circle cx="9" cy="8" r="2" fill="currentColor" />
        <circle cx="15" cy="15" r="2" fill="currentColor" />
        <circle cx="20" cy="6" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    tipo: 'Polígono',
    icono: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 4h10l4 7-4 9H7l-4-9 4-7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="4" r="1.8" fill="currentColor" />
        <circle cx="17" cy="4" r="1.8" fill="currentColor" />
        <circle cx="21" cy="11" r="1.8" fill="currentColor" />
        <circle cx="17" cy="20" r="1.8" fill="currentColor" />
        <circle cx="7" cy="20" r="1.8" fill="currentColor" />
        <circle cx="3" cy="11" r="1.8" fill="currentColor" />
      </svg>
    ),
  },
]

function obtenerSiguienteTipo(tipoActual) {
  const indexActual = OPCIONES.findIndex(
    (opcion) => opcion.tipo === tipoActual
  )

  const siguienteIndex =
    indexActual === -1
      ? 0
      : (indexActual + 1) % OPCIONES.length

  return OPCIONES[siguienteIndex].tipo
}

function obtenerOpcion(tipoActual) {
  return (
    OPCIONES.find((opcion) => opcion.tipo === tipoActual) ||
    OPCIONES[0]
  )
}

function GeometryControl({
  geometriaTipo,
  setGeometriaTipo,
}) {
  const opcion = obtenerOpcion(geometriaTipo)

  return (
    <button
      type="button"
      className="geometry-switch-btn map-floating-geometry"
      title="Cambiar tipo de geometría"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()

        setGeometriaTipo(
          obtenerSiguienteTipo(geometriaTipo)
        )
      }}
    >
      <span className="geometry-switch-icon">
        {opcion.icono}
      </span>

      <span className="geometry-switch-label">
        {opcion.tipo}
      </span>
    </button>
  )
}

export default GeometryControl