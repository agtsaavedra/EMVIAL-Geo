import { useState } from 'react'

export function useConfirmDialog() {
  const [dialogo, setDialogo] = useState(null)

  function confirmar(config) {
    setDialogo(config)
  }

  function cerrarDialogo() {
    setDialogo(null)
  }

  return {
    dialogo,
    confirmar,
    cerrarDialogo,
  }
}