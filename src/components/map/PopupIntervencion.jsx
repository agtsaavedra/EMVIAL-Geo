function PopupIntervencion({ intervencion, editarIntervencion }) {
  const puedeEditar = typeof editarIntervencion === 'function'

  return (
    <div className="popup-content">
      <strong>{intervencion.obra || 'Intervención'}</strong>

      {intervencion.nombre && (
        <>
          <br />
          {intervencion.nombre}
        </>
      )}

      {(intervencion.ubicacion || intervencion.direccion) && (
        <>
          <br />
          {intervencion.ubicacion || intervencion.direccion}
        </>
      )}

      {puedeEditar && (
        <>
          <br />

          <button
            type="button"
            className="popup-edit-btn"
            onClick={() => editarIntervencion(intervencion)}
          >
            Editar
          </button>
        </>
      )}
    </div>
  )
}

export default PopupIntervencion