/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

import { useMap } from 'react-leaflet'

// Punto de entrada visual del componente.
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

  // Render principal del componente.
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