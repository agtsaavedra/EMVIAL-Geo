function Toast({ toast }) {
  if (!toast) return null

  return (
    <div className={`toast toast-${toast.tipo || 'info'}`}>
      {toast.mensaje}
    </div>
  )
}

export default Toast