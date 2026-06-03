import { useToast } from '@hooks/ui/useToast'
import { useConfirmDialog } from '@hooks/ui/useConfirmDialog'
import { useUIState } from '@hooks/ui/useUIState'
import { useSplashScreen } from '@hooks/ui/useSplashScreen'
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue'

export function useAppUI() {
  const { toast, mostrarToast } =
    useToast()

  const {
    dialogo,
    confirmar,
    cerrarDialogo,
  } = useConfirmDialog()

  const uiState = useUIState()

  const busquedaDebounced =
    useDebouncedValue(uiState.busqueda, 220)

  const { mostrarSplash } =
    useSplashScreen()

  return {
    toast,
    mostrarToast,

    dialogo,
    confirmar,
    cerrarDialogo,

    mostrarSplash,

    busquedaDebounced,

    ...uiState,
  }
}
