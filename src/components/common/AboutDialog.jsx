function AboutDialog({
  abierto,
  onCerrar,
  estadoApp,
  estadoGeocoding,
  onLimpiarCacheGeocoding,
  periodoActivo,
}) {
  if (!abierto) return null

  const ultimoBackup = estadoApp?.ultimoBackupAutomatico
    ? new Date(
        estadoApp.ultimoBackupAutomatico
      ).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : 'Sin backups automaticos en esta sesion'

  const backupsPendientes =
    estadoApp?.backupPendiente
      ? `Si (${estadoApp.periodosBackupPendiente?.join(', ') || 'general'})`
      : 'No'

  const estadoBase = estadoApp?.dbExiste
    ? 'Disponible'
    : 'No encontrada'

  return (
    <div
      className="confirm-overlay"
      onClick={onCerrar}
    >
      <div
        className="confirm-dialog about-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          <span className="confirm-icon">
            EM
          </span>

          <div>
            <h3>EMVIAL Geo</h3>

            <small>
              Gestion operativa territorial
            </small>
          </div>
        </div>

        <div className="confirm-body about-body">
          <section className="about-summary">
            <div>
              <span>Periodo</span>
              <strong>{periodoActivo}</strong>
            </div>

            <div>
              <span>Modo</span>
              <strong>Local</strong>
            </div>

            <div>
              <span>Version</span>
              <strong>{estadoApp?.appVersion || '0.1.0'}</strong>
            </div>

            <div>
              <span>Base</span>
              <strong className={estadoApp?.dbExiste ? 'about-ok' : 'about-warn'}>
                {estadoBase}
              </strong>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-title">
              <h4>Almacenamiento</h4>
              <span>Datos locales de la aplicacion</span>
            </div>

            <div className="about-path-card">
              <strong>Base de datos</strong>
              <code>{estadoApp?.dbPath || 'No disponible'}</code>
            </div>

            <div className="about-path-card">
              <strong>Carpeta de backups</strong>
              <code>{estadoApp?.backupsDir || 'No disponible'}</code>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-title">
              <h4>Backups</h4>
              <span>Estado de resguardo automatico</span>
            </div>

            <div className="about-two-col">
              <div className="about-info-card">
                <span>Backup pendiente</span>
                <strong>{backupsPendientes}</strong>
              </div>

              <div className="about-info-card">
                <span>Ultimo automatico</span>
                <strong>{ultimoBackup}</strong>
              </div>
            </div>
          </section>

          {estadoGeocoding && (
            <section className="about-section">
              <div className="about-section-title">
                <h4>Geocoding</h4>
                <span>Cache y limite de consultas</span>
              </div>

              <div className="about-two-col">
                <div className="about-info-card">
                  <span>Consultas vigentes</span>
                  <strong>
                    {estadoGeocoding.vigentes} de {estadoGeocoding.total}
                  </strong>
                </div>

                <div className="about-info-card">
                  <span>Limite</span>
                  <strong>
                    1 cada {estadoGeocoding.intervaloMs} ms
                  </strong>
                </div>
              </div>

              <div className="about-path-card">
                <strong>Archivo cache</strong>
                <code>{estadoGeocoding.cachePath}</code>
              </div>
            </section>
          )}
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onCerrar}
          >
            Cerrar
          </button>

          {estadoGeocoding && (
            <button
              type="button"
              className="confirm-btn secondary"
              onClick={onLimpiarCacheGeocoding}
            >
              Limpiar cache
            </button>
          )}

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
