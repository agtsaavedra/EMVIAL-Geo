/**
 * Hook de diálogo de confirmación.
 *
 * Guarda la configuración del diálogo activo y expone helpers para abrirlo o
 * cerrarlo.
 */

import { useState } from 'react'

// Punto de entrada público del hook.
export function useConfirmDialog() {
  const [dialogo, setDialogo] = useState(null)

  // Abre el diálogo con la configuración recibida.
  function confirmar(config) {
    setDialogo(config)
  }

  // Cierra el diálogo de confirmación actual.
  function cerrarDialogo() {
    setDialogo(null)
  }

  // API pública que consume el resto de la aplicación.
  return {
    dialogo,
    confirmar,
    cerrarDialogo,
  }
}