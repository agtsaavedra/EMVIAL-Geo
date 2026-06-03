import { useGuideOverlay } from './useGuideOverlay'

export function useGuideOverlayWithSource({
  setForm,
  mostrarToast,
}) {
  const guideOverlay =
    useGuideOverlay({
      mostrarToast,
    })

  function usarGuiaComoFuente() {
    if (
      !guideOverlay.guideName
    )
      return

    setForm((prev) => ({
      ...prev,
      fuente:
        guideOverlay.guideName,
    }))
  }

  return {
    guideOverlay,
    guideOverlayConAcciones:
      {
        ...guideOverlay,
        usarGuiaComoFuente,
      },
  }
}