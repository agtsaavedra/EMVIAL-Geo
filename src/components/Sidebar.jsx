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
        <label>Nombre</label>
        <input
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
          <option>MICROBACHEO</option>
          <option>BACHEO</option>
          <option>TJ</option>
          <option>GRANZA</option>
          <option>RECAPADO</option>
          <option>PAVIMENTACIÓN</option>
          <option>CORDÓN CUNETA</option>
          <option>ALUMBRADO LED</option>
          <option>OTRA</option>
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

        <label>Estado</label>
        <select name="estado" value={form.estado} onChange={manejarCambio}>
          <option>Pendiente</option>
          <option>En proceso</option>
          <option>Finalizada</option>
          <option>Relevada</option>
          <option>Planificada</option>
        </select>

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
        <select name="fuente" value={form.fuente} onChange={manejarCambio}>
          <option>Carga manual</option>
          <option>WhatsApp</option>
          <option>PDF</option>
          <option>KML/KMZ</option>
          <option>Google My Maps</option>
          <option>Relevamiento propio</option>
          <option>Otro</option>
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
        <label>Observaciones</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={manejarCambio}
          placeholder="Detalle de la intervención, origen del dato, aclaraciones..."
        />

        <button className="primary" type="submit">
          {activoEditandoId
            ? 'Actualizar intervención'
            : 'Guardar intervención'}
        </button>
      </form>
    </aside>
  )
}

export default Sidebar