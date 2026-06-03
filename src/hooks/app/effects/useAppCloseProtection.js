/*
  useAppCloseProtection

  Efecto global para interceptar el cierre de la ventana Electron.

  Si hay cambios sin guardar, muestra un diálogo de confirmación antes de
  permitir el cierre definitivo de la aplicación.
*/

import { useEffect } from 'react'

export function useAppCloseProtection({
  hayCambiosSinGuardar,
  confirmar,
}) {
  useEffect(() => {
    // Responde al evento de cierre enviado desde el proceso principal de Electron.
    function manejarSolicitudCierre() {
      if (!hayCambiosSinGuardar) {
        window.api.confirmarCierreApp()
        return
      }

      confirmar({
        titulo: 'Salir sin guardar',
        mensaje:
          'Hay cambios sin guardar en la intervención actual.',
        detalle:
          'Si salís ahora, se perderán las modificaciones realizadas.',
        textoConfirmar: 'Salir igual',
        textoCancelar: 'Seguir editando',
        danger: true,
        onConfirmar: () => {
          window.api.confirmarCierreApp()
        },
      })
    }

    const cleanup =
      window.api.onAppCloseRequest(
        manejarSolicitudCierre
      )

    return () => {
      cleanup?.()
    }
  }, [
    hayCambiosSinGuardar,
    confirmar,
  ])
}