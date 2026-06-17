/*
  useTopbarActions

  Ensambla las acciones del menu superior sin mezclar implementaciones:
  exportaciones, importaciones GIS, backups/restauraciones y About.
*/

import { useExportActions } from './useExportActions'
import { useImportActions } from './useImportActions'
import { useBackupMenuActions } from './useBackupMenuActions'

export function useTopbarActions({
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
}) {
  const intervencionesParaExportar =
    intervencionesFiltradas ||
    intervencionesDelPeriodo

  const exportActions = useExportActions({
    periodoActivo,
    intervencionesParaExportar,
    setMenuAbierto,
    mostrarToast,
    confirmar,
  })

  const importActions = useImportActions({
    periodoActivo,
    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    modoConsulta,
    setMenuAbierto,
    mostrarToast,
    confirmar,
  })

  const backupMenuActions = useBackupMenuActions({
    periodoActivo,
    modoConsulta,
    setMenuAbierto,
    mostrarToast,
    confirmar,
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
    abrirAbout,
  })

  return {
    ...exportActions,
    ...importActions,
    ...backupMenuActions,
  }
}
