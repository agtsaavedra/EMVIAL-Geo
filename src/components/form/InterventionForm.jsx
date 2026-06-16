import {
  useLayoutEffect,
  useRef,
} from 'react'

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
import {
  esLineaIntervencion,
  esPoligonoIntervencion,
  esPuntoIntervencion,
} from '@domain/intervencion'

function AutoGrowTextarea({
  value,
  onChange,
  className,
  minRows = 2,
  ...props
}) {
  const ref = useRef(null)

  function ajustarAltura() {
    const textarea = ref.current
    if (!textarea) return

    const computed =
      window.getComputedStyle(textarea)
    const minHeight =
      Number.parseFloat(computed.minHeight) || 0

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(
      textarea.scrollHeight + 4,
      minHeight
    )}px`
  }

  useLayoutEffect(() => {
    const frameId =
      window.requestAnimationFrame(ajustarAltura)

    return () =>
      window.cancelAnimationFrame(frameId)
  }, [value])

  function manejarCambio(e) {
    onChange?.(e)

    window.requestAnimationFrame(
      ajustarAltura
    )
  }

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={manejarCambio}
      onFocus={ajustarAltura}
      rows={minRows}
      {...props}
    />
  )
}

// Punto de entrada visual del componente.
function InterventionForm({
  form,
  ubicacionAutomaticaLinea,
  ubicacionManualLinea,
  recalcularUbicacionLinea,
  manejarCambio,
  guardarIntervencion,
  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,
  activoEditandoId,
  cancelarEdicion,
  hayCambiosSinGuardar,
  modoConsulta,
}) {

  const cantidadPuntos = form.geometria?.length || 0

  let mensajeGuardar = activoEditandoId
    ? 'Actualizar intervención'
    : 'Guardar intervención'

  let guardarDeshabilitado = false
  const esPunto =
    esPuntoIntervencion(form)
  const esLinea =
    esLineaIntervencion(form)
  const esPoligono =
    esPoligonoIntervencion(form)

  if (esPunto && cantidadPuntos < 1) {
    mensajeGuardar = 'Marcá una ubicación'
    guardarDeshabilitado = true
  }

  if (esLinea && cantidadPuntos < 2) {
    mensajeGuardar = 'Marcá al menos 2 puntos'
    guardarDeshabilitado = true
  }

  if (esPoligono && cantidadPuntos < 3) {
    mensajeGuardar = 'Marcá al menos 3 puntos'
    guardarDeshabilitado = true
  }
  // Render principal del componente.
  return (


    <form
      onSubmit={guardarIntervencion}
      className="form"
    >
      {modoConsulta && (
        <div className="consultation-banner">
          Modo consulta activo. La carga y edicion estan bloqueadas.
        </div>
      )}

      <fieldset
        className="form-fieldset"
        disabled={modoConsulta}
      >
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

      <label>
        Ubicación
        {ubicacionAutomaticaLinea && (
          <span className="field-chip">
            Automatica
          </span>
        )}
        {ubicacionManualLinea && (
          <span className="field-chip field-chip-manual">
            Manual
          </span>
        )}
      </label>
      <div className="location-row">
        <AutoGrowTextarea
          className="location-input"
          name="ubicacion"
          value={form.ubicacion}
          title={form.ubicacion}
          onChange={manejarCambio}
          minRows={2}
          placeholder="Ej: Falucho 2400 e/ Stgo. del Estero y Santa Fe"
        />

        {esLinea &&
          cantidadPuntos >= 2 && (
            <button
              type="button"
              className="secondary-form-btn"
              onClick={recalcularUbicacionLinea}
              title="Recalcular ubicacion y cuadras"
            >
              Recalcular
            </button>
          )}
      </div>

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
          <AutoGrowTextarea
            className="address-input"
            name="direccion"
            value={form.direccion}
            onChange={manejarCambio}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                buscarDireccion()
              }
            }}
            minRows={2}
            placeholder="Ej: Av. Colón 3200"
          />

          <button
            type="button"
            className="secondary-form-btn"
            onClick={buscarDireccion}
          >
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
          disabled={
            guardarDeshabilitado ||
            modoConsulta
          }
        >
          {mensajeGuardar}
        </button>
      </div>
      </fieldset>
    </form>
  )
}

export default InterventionForm
