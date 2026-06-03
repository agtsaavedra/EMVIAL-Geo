/**
 * Notificación temporal tipo toast.
 *
 * Muestra mensajes de éxito, error o información. Puede incluir una acción
 * opcional, por ejemplo deshacer una eliminación.
 */

// Punto de entrada visual del componente.
function Toast({ toast }) {
  if (!toast) return null

  function manejarAccion() {
    toast.onAccion?.()
  }

  // Render principal del componente.
  return (
    <div className={`toast toast-${toast.tipo || 'info'}`}>
      <span>
        {toast.mensaje}
      </span>

      {toast.accionTexto &&
        toast.onAccion && (
          <button
            type="button"
            className="toast-action-btn"
            onClick={manejarAccion}
          >
            {toast.accionTexto}
          </button>
        )}
    </div>
  )
}

export default Toast
