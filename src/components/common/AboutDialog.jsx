/**
 * Modal "Acerca de".
 *
 * Muestra información de diagnóstico de la app, período activo y rutas internas
 * obtenidas desde Electron.
 */

// Punto de entrada visual del componente.
function AboutDialog({
  abierto,
  onCerrar,
  estadoApp,
  periodoActivo,
}) {
  if (!abierto) return null

  // Render principal del componente.
  return (
    <div
      className="confirm-overlay"
      onClick={onCerrar}
    >
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===========================
            Header
        =========================== */}
        <div className="confirm-header">
          <span className="confirm-icon">
            📍
          </span>

          <div>
            <h3>EMVIAL Geo</h3>

            <small>
              Gestión operativa territorial
            </small>
          </div>
        </div>

        {/* ===========================
            Información app
        =========================== */}
        <div className="confirm-body">
          <div className="about-row">
            <strong>Período activo</strong>

            <span>{periodoActivo}</span>
          </div>

          <div className="about-row">
            <strong>Modo</strong>

            <span>Local (SQLite)</span>
          </div>

          <div className="about-row">
            <strong>Base de datos</strong>

            <small>
              {estadoApp?.dbPath}
            </small>
          </div>

          <div className="about-row">
            <strong>Backups</strong>

            <small>
              {estadoApp?.backupsDir}
            </small>
          </div>
        </div>

        {/* ===========================
            Footer
        =========================== */}
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onCerrar}
          >
            Cerrar
          </button>

          <button
            type="button"
            className="confirm-btn"
            onClick={() =>
              window.api.abrirCarpetaBackups()
            }
          >
            Abrir backups
          </button>
        </div>
      </div>
    </div>
  )
}

export default AboutDialog