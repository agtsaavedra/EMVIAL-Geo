/**
 * Hook adaptador entre imagen guía y formulario.
 *
 * Extiende `useGuideOverlay` con la acción de usar el nombre del archivo guía
 * como fuente de la intervención actual.
 */

import { useMemo } from 'react'

import { useGuideOverlay } from '@hooks/map/useGuideOverlay'

// Punto de entrada público del hook.
export function useGuideOverlayWithSource({
  setForm,
  mostrarToast,
}) {
  const guideOverlay = useGuideOverlay()

  const guideOverlayConAcciones =
    useMemo(
      () => ({
        ...guideOverlay,

        usarGuiaComoFuente: () => {
          if (!guideOverlay.guideName) return

          setForm((prev) => ({
            ...prev,
            fuente: guideOverlay.guideName,
          }))

          mostrarToast(
            'Fuente cargada desde la guía.',
            'success'
          )
        },
      }),
      [
        guideOverlay,
        setForm,
        mostrarToast,
      ]
    )

  // API pública que consume el resto de la aplicación.
  return {
    guideOverlay,
    guideOverlayConAcciones,
  }
}