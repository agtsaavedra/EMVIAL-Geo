function Topbar({
  busqueda,
  setBusqueda,
  menuAbierto,
  setMenuAbierto,
  exportarKmlActual,
  crearBackup,
  restaurarBackup,
  abrirCarpetaBackups,
}) {
  return (
    <header className="topbar">
      <div>
        <h2>Mapa de intervenciones</h2>
        <span>Mar del Plata / Partido de General Pueyrredon</span>
      </div>

      <div className="topbar-actions">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por obra, barrio, estado o ubicación..."
        />

        <div className="menu-wrapper">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMenuAbierto((prev) => !prev)}
          >
            ☰
          </button>

          {menuAbierto && (
            <div className="dropdown-menu">
              <button type="button" onClick={exportarKmlActual}>
                Exportar KML
              </button>

              <button type="button" onClick={crearBackup}>
                Crear backup
              </button>

              <button
                type="button"
                className="danger"
                onClick={restaurarBackup}
              >
                Restaurar backup
              </button>

              <button type="button" onClick={abrirCarpetaBackups}>
                Abrir carpeta de backups
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar