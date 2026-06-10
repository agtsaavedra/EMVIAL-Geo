/*
  useAppActionsBundle

  Agrupa comportamientos globales de la aplicación:
  acciones del topbar, acciones del panel de intervenciones, diálogo About,
  atajos de teclado y protección de cierre.

  Este hook centraliza comportamientos transversales sin mezclarlos con el
  render de App.jsx ni con la lógica de datos.
*/

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
  intervencionesFiltradas,
  guardarIntervencionEnDB,
  guardarIntervencionesMasivoEnDB,
  eliminarIntervencion,
  restaurarIntervencion,
  modoConsulta,

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
    exportarGeoJSONActual,
    exportarShpActual,
    exportarInformePDFActual,
    importarArchivoGISActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  } = useTopbarActions({
    periodoActivo,
    intervencionesDelPeriodo,
    intervencionesFiltradas,
    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    modoConsulta,
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
    exportarGeoJSONActual,
    exportarShpActual,
    exportarInformePDFActual,
    importarArchivoGISActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,

    eliminarIntervencionProtegida,
  }
}
