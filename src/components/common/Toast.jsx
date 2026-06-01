function Toast({ toast }) {
  if (!toast) return null

  function manejarAccion() {
    toast.onAccion?.()
  }

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
