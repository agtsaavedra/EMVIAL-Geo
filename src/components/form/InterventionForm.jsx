/**
 * Componente de interfaz de EMVIAL Geo.
 *
 * Forma parte de la capa visual y recibe por props la lógica preparada por
 * hooks/controladores superiores.
 */

import {
  OBRAS,
  FUENTES,
} from '@constants/intervenciones'


// Punto de entrada visual del componente.
function InterventionForm({
  form,
  manejarCambio,
  guardarIntervencion,
  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,
  activoEditandoId,
  cancelarEdicion,
  hayCambiosSinGuardar,
}) {

  const cantidadPuntos = form.geometria?.length || 0

  let mensajeGuardar = activoEditandoId
    ? 'Actualizar intervención'
    : 'Guardar intervención'

  let guardarDeshabilitado = false

  if (form.geometriaTipo === 'Punto' && cantidadPuntos < 1) {
    mensajeGuardar = 'Marcá una ubicación'
    guardarDeshabilitado = true
  }

  if (form.geometriaTipo === 'Línea' && cantidadPuntos < 2) {
    mensajeGuardar = 'Marcá al menos 2 puntos'
    guardarDeshabilitado = true
  }

  if (form.geometriaTipo === 'Polígono' && cantidadPuntos < 3) {
    mensajeGuardar = 'Marcá al menos 3 puntos'
    guardarDeshabilitado = true
  }
  // Render principal del componente.
  return (


    <form onSubmit={guardarIntervencion} className="form">
      {activoEditandoId && (
        <div className="edit-banner">
          <div>
            <strong>✏️ Editando intervención</strong>

            <span>
              {hayCambiosSinGuardar
                ? 'Cambios sin guardar'
                : 'Sin cambios pendientes'}
            </span>
          </div>

          <button
            type="button"
            onClick={cancelarEdicion}
          >
            Cancelar edición
          </button>
        </div>
      )}
      <label>Nombre</label>
      <input
        autoFocus={Boolean(activoEditandoId)}
        name="nombre"
        value={form.nombre}
        onChange={manejarCambio}
        placeholder="Ej: Línea 96"
      />

      <label>Mes de terminación</label>
      <input
        type="date"
        name="mesTerminacion"
        value={form.mesTerminacion}
        onChange={manejarCambio}
      />

      <label>Obra</label>
      <select name="obra" value={form.obra} onChange={manejarCambio}>
        {OBRAS.map((obra) => (
          <option key={obra} value={obra}>
            {obra}
          </option>
        ))}
      </select>

      <label>Ubicación</label>
      <input
        name="ubicacion"
        value={form.ubicacion}
        onChange={manejarCambio}
        placeholder="Ej: Falucho 2400 e/ Stgo. del Estero y Santa Fe"
      />

      <label>Barrio / zona</label>
      <input
        name="barrio"
        value={form.barrio}
        onChange={manejarCambio}
        placeholder="Ej: Centro, Las Avenidas, Puerto..."
      />

      <label>Inspector</label>
      <input
        name="inspector"
        value={form.inspector}
        onChange={manejarCambio}
        placeholder="Ej: GM"
      />

      <label>Realizó</label>
      <input
        name="realizo"
        value={form.realizo}
        onChange={manejarCambio}
        placeholder="Ej: Coop. de Trabajo..."
      />

      <label>Cuadras</label>
      <input
        type="number"
        step="0.01"
        name="cuadras"
        value={form.cuadras}
        onChange={manejarCambio}
        placeholder="Ej: 4"
      />

      <label>Metros lineales</label>
      <input
        type="number"
        step="0.01"
        name="metrosLineales"
        value={form.metrosLineales}
        onChange={manejarCambio}
        placeholder="Ej: 2515.35"
      />

      <label>Metros cuadrados</label>
      <input
        type="number"
        step="0.01"
        name="metrosCuadrados"
        value={form.metrosCuadrados}
        onChange={manejarCambio}
        placeholder="Ej: 6"
      />

      <label>Fuente</label>

      <select
        name="fuente"
        value={form.fuente}
        onChange={manejarCambio}
      >
        {FUENTES.map((fuente) => (
          <option key={fuente} value={fuente}>
            {fuente}
          </option>
        ))}

        {form.fuente &&
          !FUENTES.includes(form.fuente) && (
            <option value={form.fuente}>
              {form.fuente}
            </option>
          )}
      </select>
      <label>Dirección / búsqueda geográfica</label>

      <div className="address-wrapper">
        <div className="address-row">
          <input
            name="direccion"
            value={form.direccion}
            onChange={manejarCambio}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                buscarDireccion()
              }
            }}
            placeholder="Ej: Av. Colón 3200"
          />

          <button type="button" onClick={buscarDireccion}>
            Buscar
          </button>
        </div>

        {sugerencias.length > 0 && (
          <div className="suggestions">
            {sugerencias.map((sugerencia) => (
              <button
                key={sugerencia.place_id}
                type="button"
                onClick={() => seleccionarSugerencia(sugerencia)}
              >
                {sugerencia.display_name}
              </button>
            ))}
          </div>
        )}

        {buscandoDireccion && (
          <small className="searching">Buscando sugerencias...</small>
        )}
      </div>

      <label>Latitud</label>
      <input name="latitud" value={form.latitud} readOnly />

      <label>Longitud</label>
      <input name="longitud" value={form.longitud} readOnly />

      <label>Observaciones</label>
      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={manejarCambio}
        placeholder="Detalle de la intervención, origen del dato, aclaraciones..."
      />

      <div className="form-actions">
        <button
          className="primary"
          type="submit"
          disabled={guardarDeshabilitado}
        >
          {mensajeGuardar}
        </button>
      </div>
    </form>
  )
}

export default InterventionForm
