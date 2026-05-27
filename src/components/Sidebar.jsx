function Sidebar({
  form,
  manejarCambio,
  guardarIntervencion,
  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,
  activoEditandoId,
}) {
  return (
    <aside className="sidebar">
      <h1>EMVIAL Geo</h1>
      <p className="subtitle">Gestión operativa territorial</p>

      <form onSubmit={guardarIntervencion} className="form">
        <label>Área</label>
        <select name="area" value={form.area} onChange={manejarCambio}>
          <option>Vialidad</option>
          <option>Alumbrado</option>
          <option>Conservación urbana</option>
          <option>Espacios públicos</option>
          <option>Otra</option>
        </select>

        <label>Fecha</label>
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={manejarCambio}
        />

        <label>Barrio / zona</label>
        <input
          name="barrio"
          value={form.barrio}
          onChange={manejarCambio}
          placeholder="Ej: Las Heras, Centro, Puerto..."
        />

        <label>Tipo de intervención</label>
        <select
          name="tipoIntervencion"
          value={form.tipoIntervencion}
          onChange={manejarCambio}
        >
          <option>Mantenimiento</option>
          <option>Reparación</option>
          <option>Obra nueva</option>
          <option>Relevamiento</option>
          <option>Alumbrado LED</option>
          <option>Bacheo</option>
          <option>Granza</option>
          <option>Recapado</option>
          <option>Pavimentación</option>
          <option>Otro</option>
        </select>

        <label>Subtipo / detalle</label>
        <input
          name="subtipo"
          value={form.subtipo}
          onChange={manejarCambio}
          placeholder="Ej: calle reparada, luminaria, cordón cuneta..."
        />

        <label>Estado</label>
        <select name="estado" value={form.estado} onChange={manejarCambio}>
          <option>Pendiente</option>
          <option>En proceso</option>
          <option>Finalizada</option>
          <option>Relevada</option>
          <option>Planificada</option>
        </select>

        <label>Fuente de información</label>
        <select name="fuente" value={form.fuente} onChange={manejarCambio}>
          <option>Carga manual</option>
          <option>WhatsApp</option>
          <option>PDF</option>
          <option>KML/KMZ</option>
          <option>Google My Maps</option>
          <option>Relevamiento propio</option>
          <option>Otro</option>
        </select>

        <label>Dirección / referencia</label>

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

        <label>Tipo de geometría</label>
        <select
          name="geometriaTipo"
          value={form.geometriaTipo}
          onChange={manejarCambio}
        >
          <option>Punto</option>
          <option>Línea</option>
          <option>Polígono</option>
        </select>

        <label>Unidad de medida</label>
        <select name="unidad" value={form.unidad} onChange={manejarCambio}>
          <option>cuadras</option>
          <option>metros</option>
          <option>kilómetros</option>
          <option>m²</option>
          <option>toneladas</option>
          <option>unidades</option>
          <option>sin unidad</option>
        </select>

        <label>Cantidad</label>
        <input
          type="number"
          step="0.01"
          name="cantidad"
          value={form.cantidad}
          onChange={manejarCambio}
          placeholder="Ej: 2.4"
        />

        <label>Observaciones</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={manejarCambio}
          placeholder="Detalle de la intervención, origen del dato, aclaraciones..."
        />

        <button className="primary" type="submit">
          {activoEditandoId ? 'Actualizar intervención' : 'Guardar intervención'}
        </button>
      </form>
    </aside>
  )
}

export default Sidebar