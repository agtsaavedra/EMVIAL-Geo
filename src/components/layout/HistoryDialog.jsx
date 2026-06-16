const ETIQUETAS = {
  nombre: 'Nombre',
  mesTerminacion: 'Mes de terminacion',
  obra: 'Obra',
  ubicacion: 'Ubicacion',
  barrio: 'Barrio',
  fuente: 'Fuente',
  inspector: 'Inspector',
  realizo: 'Realizo',
  cuadras: 'Cuadras',
  metrosLineales: 'Metros lineales',
  metrosCuadrados: 'Metros cuadrados',
  descripcion: 'Observaciones',
  direccion: 'Busqueda geografica',
  latitud: 'Latitud',
  longitud: 'Longitud',
  geometriaTipo: 'Tipo de geometria',
  geometria: 'Geometria',
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Date(fecha).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function formatearValor(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Sin dato'
  }

  if (Array.isArray(valor)) {
    return `${valor.length} punto${valor.length === 1 ? '' : 's'}`
  }

  if (typeof valor === 'object') {
    return JSON.stringify(valor)
  }

  return String(valor)
}

function obtenerCambios(evento) {
  const cambios = evento?.cambios || {}

  if (!cambios || Array.isArray(cambios)) {
    return []
  }

  return Object.entries(cambios)
    .filter(
      ([campo]) =>
        ![
          'updatedAt',
          'createdAt',
          'version',
          'syncStatus',
          'updatedBy',
        ].includes(campo)
    )
    .map(([campo, valores]) => ({
      campo,
      etiqueta: ETIQUETAS[campo] || campo,
      anterior: formatearValor(valores?.anterior),
      actual: formatearValor(valores?.actual),
    }))
}

function describirEvento(evento) {
  const cambios = obtenerCambios(evento)

  if (evento.accion === 'crear') {
    return 'Se creo la intervencion.'
  }

  if (evento.accion === 'eliminar') {
    return 'Se elimino la intervencion.'
  }

  if (!cambios.length) {
    return 'Se guardo la intervencion sin cambios relevantes.'
  }

  const campos = cambios
    .slice(0, 3)
    .map((cambio) => cambio.etiqueta)
    .join(', ')

  const extra =
    cambios.length > 3
      ? ` y ${cambios.length - 3} campo${cambios.length - 3 === 1 ? '' : 's'} mas`
      : ''

  return `Se actualizaron ${campos}${extra}.`
}

function HistoryDialog({
  abierto,
  intervencion,
  historial = [],
  cargando,
  onCerrar,
}) {
  if (!abierto) return null

  return (
    <div
      className="confirm-overlay"
      onClick={onCerrar}
    >
      <div
        className="confirm-dialog history-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          <span className="confirm-icon">HC</span>

          <div>
            <h3>Historial de cambios</h3>
            <small>
              {intervencion?.nombre ||
                intervencion?.obra ||
                'Intervencion'}
            </small>
          </div>
        </div>

        <div className="history-list">
          {cargando && (
            <p className="empty">
              Cargando historial...
            </p>
          )}

          {!cargando && historial.length === 0 && (
            <p className="empty">
              Todavia no hay movimientos registrados.
            </p>
          )}

          {!cargando &&
            historial.map((evento) => {
              const cambios = obtenerCambios(evento)

              return (
                <article
                  key={evento.id}
                  className="history-item"
                >
                  <div className="history-item-header">
                    <strong>
                      {describirEvento(evento)}
                    </strong>
                    <span>
                      {formatearFecha(evento.fecha)}
                    </span>
                  </div>

                  {cambios.length > 0 && (
                    <div className="history-changes">
                      {cambios.map((cambio) => (
                        <div
                          key={`${evento.id}-${cambio.campo}`}
                          className="history-change"
                        >
                          <b>{cambio.etiqueta}</b>
                          <span>
                            <small>Antes</small>
                            {cambio.anterior}
                          </span>
                          <span>
                            <small>Despues</small>
                            {cambio.actual}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryDialog
