import { useMap } from 'react-leaflet'

function PopupIntervencion({ intervencion, editarIntervencion }) {
  const map = useMap()

  const puedeEditar =
    typeof editarIntervencion === 'function'

  function manejarEditar(e) {
    e.preventDefault()
    e.stopPropagation()

    // Cerramos el popup para que no tape la geometría.
    map.closePopup()

    // Cargamos la intervención en el formulario.
    editarIntervencion(intervencion)
  }

  return (
    <div className="popup-content">
      <strong>
        {intervencion.obra || 'Intervención'}
      </strong>

      {intervencion.nombre && (
        <>
          <br />
          {intervencion.nombre}
        </>
      )}

      {(intervencion.ubicacion ||
        intervencion.direccion) && (
          <>
            <br />
            {intervencion.ubicacion ||
              intervencion.direccion}
          </>
        )}

      {puedeEditar && (
        <>
          <br />

          <button
            type="button"
            className="popup-edit-btn"
            onClick={manejarEditar}
          >
            Editar
          </button>
        </>
      )}
    </div>
  )
}

export default PopupIntervencion