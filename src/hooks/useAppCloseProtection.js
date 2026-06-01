import { useEffect } from 'react'

export function useAppCloseProtection({
  hayCambiosSinGuardar,
  confirmar,
}) {
  useEffect(() => {
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