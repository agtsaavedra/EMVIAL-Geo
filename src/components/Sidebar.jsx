function Sidebar({
  form,
  manejarCambio,
  guardarActivo,
  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,
  activoEditandoId,
}) {
  return (
    <aside className="sidebar">
      <h1>EMVIAL</h1>
      <p className="subtitle">Gestión georreferenciada de activos</p>

      <form onSubmit={guardarActivo} className="form">
        <label>Tipo de activo</label>
        <select name="tipo" value={form.tipo} onChange={manejarCambio}>
          <option>Luminaria</option>
          <option>Semáforo</option>
          <option>Cartel</option>
          <option>Bache</option>
          <option>Reparación</option>
          <option>Otro</option>
        </select>

        <label>Dirección</label>

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
              required
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

        <label>Estado</label>
        <select name="estado" value={form.estado} onChange={manejarCambio}>
          <option>Pendiente</option>
          <option>En reparación</option>
          <option>Reparado</option>
          <option>Relevado</option>
        </select>

        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={manejarCambio}
          placeholder="Detalle de la intervención..."
        />

        <button className="primary" type="submit">
          {activoEditandoId ? 'Actualizar activo' : 'Guardar activo'}
        </button>
      </form>
    </aside>
  )
}

export default Sidebar