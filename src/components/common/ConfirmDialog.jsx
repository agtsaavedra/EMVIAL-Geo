/**
 * Diálogo genérico de confirmación.
 *
 * Se usa para acciones sensibles o destructivas, como eliminar intervenciones,
 * restaurar backups o descartar cambios sin guardar.
 */

// Punto de entrada visual del componente.
function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  detalle,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
  danger = false,
}) {
  if (!abierto) return null

  // Render principal del componente.
  return (
    <div
      className="confirm-overlay"
      onClick={onCancelar}
    >
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="confirm-header">
          <span className="confirm-icon">
            ⚠
          </span>

          <h3>{titulo}</h3>
        </div>

        {/* Body */}
        <div className="confirm-body">
          <p>{mensaje}</p>

          {detalle && (
            <small>{detalle}</small>
          )}
        </div>

        {/* Footer */}
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            className={`confirm-btn ${
              danger ? 'danger' : ''
            }`}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog