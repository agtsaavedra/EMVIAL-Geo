function AssetsPanel({ activosFiltrados, editarActivo, eliminarActivo }) {
  return (
    <div className="panel">
      <h3>Activos cargados</h3>

      {activosFiltrados.length === 0 ? (
        <p className="empty">Todavía no hay activos cargados.</p>
      ) : (
        activosFiltrados.map((activo) => (
          <div className="card" key={activo.id}>
            <div className="card-header">
              <strong>{activo.tipo}</strong>

              <button
                type="button"
                className="edit-btn"
                onClick={() => editarActivo(activo)}
              >
                Editar
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={() => eliminarActivo(activo.id)}
              >
                Eliminar
              </button>
            </div>

            <span>{activo.estado}</span>
            <p>{activo.direccion}</p>
            <small>
              {activo.latitud}, {activo.longitud}
            </small>
          </div>
        ))
      )}
    </div>
  )
}

export default AssetsPanel