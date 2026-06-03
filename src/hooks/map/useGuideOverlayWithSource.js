import { useMemo } from 'react'

import { useGuideOverlay } from '@hooks/map/useGuideOverlay'

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

  return {
    guideOverlay,
    guideOverlayConAcciones,
  }
}