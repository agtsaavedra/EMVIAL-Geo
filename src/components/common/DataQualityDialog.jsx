import {
  useEffect,
  useState,
} from 'react'
import {
  analizarCalidadIntervencionesAsync,
} from '@services/dataQualityWorker'

function DataQualityDialog({
  abierto,
  intervenciones = [],
  onClose,
  onFocusIssue,
  onEditIssue,
}) {
  const [reporte, setReporte] =
    useState(null)

  useEffect(() => {
    let activo = true

    if (!abierto) {
      setReporte(null)
      return undefined
    }

    setReporte(null)

    analizarCalidadIntervencionesAsync(
      intervenciones
    ).then((resultado) => {
      if (activo) {
        setReporte(resultado)
      }
    })

    return () => {
      activo = false
    }
  }, [abierto, intervenciones])

  if (!abierto) return null

  const primerosIssues =
    reporte?.issues.slice(0, 12) || []

  return (
    <div
      className="confirm-overlay"
      onClick={onClose}
    >
      <div
        className="confirm-dialog data-quality-dialog"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="confirm-header">
          <div>
            <span className="data-quality-eyebrow">
              Control operativo
            </span>
            <h3>Calidad de datos</h3>
          </div>

          <button
            type="button"
            className="confirm-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <p className="confirm-message">
          {!reporte
            ? 'Analizando intervenciones filtradas...'
            : reporte.totalIssues
            ? `Se encontraron ${reporte.totalIssues} observaciones sobre ${reporte.totalIntervenciones} intervenciones filtradas.`
            : `No se encontraron observaciones sobre ${reporte.totalIntervenciones} intervenciones filtradas.`}
        </p>

        <div className="data-quality-summary">
          <div>
            <strong>{reporte?.altas || 0}</strong>
            <span>Altas</span>
          </div>
          <div>
            <strong>{reporte?.medias || 0}</strong>
            <span>Medias</span>
          </div>
          <div>
            <strong>{reporte?.bajas || 0}</strong>
            <span>Bajas</span>
          </div>
        </div>

        {reporte?.porTipo.length > 0 && (
          <section className="data-quality-section">
            <h4>Resumen</h4>
            <div className="data-quality-tags">
              {reporte.porTipo.map((item) => (
                <span
                  key={item.tipo}
                  className={`quality-${item.severidad}`}
                >
                  {item.tipo}: {item.total}
                </span>
              ))}
            </div>
          </section>
        )}

        {primerosIssues.length > 0 && (
          <section className="data-quality-section">
            <h4>Primeras observaciones</h4>
            <div className="data-quality-list">
              {primerosIssues.map((issue, index) => (
                <article
                  key={`${issue.id || issue.nombre}-${issue.tipo}-${index}`}
                  className="data-quality-item"
                >
                  <div className="data-quality-item-main">
                    <strong>{issue.nombre}</strong>
                    <span>
                      {issue.tipo} - {issue.mensaje}
                    </span>
                    <small>
                      {issue.obra || 'Sin obra'}
                      {issue.barrio
                        ? ` - ${issue.barrio}`
                        : ''}
                    </small>
                  </div>

                  <div className="data-quality-item-actions">
                    <button
                      type="button"
                      onClick={() =>
                        onFocusIssue?.(issue)
                      }
                    >
                      Ver
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onEditIssue?.(issue)
                      }
                    >
                      Editar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataQualityDialog
