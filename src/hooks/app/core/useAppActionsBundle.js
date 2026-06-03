import { useAboutDialog } from '@hooks/app/dialogs/useAboutDialog'
import { useAppActions } from '@hooks/app/actions/useAppActions'
import { useTopbarActions } from '@hooks/app/actions/useTopbarActions'
import { useAssetActions } from '@hooks/app/actions/useAssetActions'
import { useKeyboardShortcuts } from '@hooks/app/effects/useKeyboardShortcuts'
import { useAppCloseProtection } from '@hooks/app/effects/useAppCloseProtection'

export function useAppActionsBundle({
  // UI / dialogs
  confirmar,
  mostrarToast,

  // estado visual
  setIntervencionEnfocada,
  setSidebarAbierto,
  setAssetsPanelAbierto,
  setMenuAbierto,

  modoDibujo,
  setModoDibujo,

  // formulario
  editarIntervencion,
  cancelarEdicion,
  hayCambiosSinGuardar,

  // periodo
  periodoActivo,
  setPeriodoActivo,

  // datos
  intervencionesDelPeriodo,
  eliminarIntervencion,
  restaurarIntervencion,

  // backups
  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,
}) {
  const {
    aboutAbierto,
    estadoApp,
    abrirAbout,
    cerrarAbout,
  } = useAboutDialog()

  const {
    manejarEnfocarIntervencion,
    manejarEditarIntervencion,
    manejarCancelarEdicion,
    manejarCambioPeriodo,
  } = useAppActions({
    setIntervencionEnfocada,
    setSidebarAbierto,
    setAssetsPanelAbierto,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,
    confirmar,
    setPeriodoActivo,
  })

  const {
    exportarKmlActual,
    exportarExcelActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  } = useTopbarActions({
    periodoActivo,
    intervencionesDelPeriodo,
    setMenuAbierto,
    mostrarToast,
    confirmar,
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
    abrirAbout,
  })

  const {
    eliminarIntervencionProtegida,
  } = useAssetActions({
    confirmar,
    eliminarIntervencion,
    mostrarToast,
    restaurarIntervencion,
  })

  useKeyboardShortcuts({
    modoDibujo,
    setModoDibujo,
    mostrarToast,
  })

  useAppCloseProtection({
    hayCambiosSinGuardar,
    confirmar,
  })

  return {
    aboutAbierto,
    estadoApp,
    cerrarAbout,

    manejarEnfocarIntervencion,
    manejarEditarIntervencion,
    manejarCancelarEdicion,
    manejarCambioPeriodo,

    exportarKmlActual,
    exportarExcelActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,

    eliminarIntervencionProtegida,
  }
}
