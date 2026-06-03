/*
  useAppUI

  Agrupa los hooks relacionados con estado visual y feedback global:
  toast, diálogos de confirmación, estado UI, splash inicial y búsqueda
  debounced.

  Separa el estado de interfaz del resto de la lógica de datos/formulario.
*/

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
