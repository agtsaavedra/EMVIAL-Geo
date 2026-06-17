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

  return (
    <div
      className="confirm-overlay"
      onClick={onCerrar}
    >
      <div
        className="confirm-dialog"
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

        <div className="confirm-body">
          <div className="about-row">
            <strong>Periodo activo</strong>
            <span>{periodoActivo}</span>
          </div>

          <div className="about-row">
            <strong>Modo</strong>
            <span>Local (SQLite)</span>
          </div>

          <div className="about-row">
            <strong>Version</strong>
            <span>{estadoApp?.appVersion || '0.1.0'}</span>
          </div>

          <div className="about-row">
            <strong>Base activa</strong>
            <span>{estadoApp?.dbExiste ? 'Disponible' : 'No encontrada'}</span>
          </div>

          <div className="about-row">
            <strong>Base de datos</strong>
            <small>{estadoApp?.dbPath}</small>
          </div>

          <div className="about-row">
            <strong>Backups</strong>
            <small>{estadoApp?.backupsDir}</small>
          </div>

          <div className="about-row">
            <strong>Backup pendiente</strong>
            <span>{backupsPendientes}</span>
          </div>

          <div className="about-row">
            <strong>Ultimo backup automatico</strong>
            <small>{ultimoBackup}</small>
          </div>

          {estadoGeocoding && (
            <>
              <div className="about-row">
                <strong>Geocoding cache</strong>
                <small>
                  {estadoGeocoding.vigentes} consultas vigentes de {estadoGeocoding.total}.
                  {' '}Limite: 1 consulta cada {estadoGeocoding.intervaloMs} ms.
                </small>
              </div>

              <div className="about-row">
                <strong>Archivo cache</strong>
                <small>{estadoGeocoding.cachePath}</small>
              </div>
            </>
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
