/**
 * Hook de coordinación de backups.
 *
 * Delega las operaciones reales en la API segura expuesta por Electron
 * (`window.api`) y recarga las intervenciones cuando una restauración
 * modifica la base de datos local.
 */

// Punto de entrada público del hook.
export function useBackups({
  periodoActivo,
  recargarIntervenciones,
}) {
  // Crea un backup manual del período activo usando la API de Electron.
  async function crearBackup() {
    const resultado = await window.api.crearBackupManual(periodoActivo)

    if (!resultado.ok) {
      return resultado
    }

    return {
      ok: true,
      message: 'Backup creado correctamente.',
      path: resultado.path,
    }
  }

  // Restaura un backup completo y recarga la información visible.
  async function restaurarBackup() {
    const resultado = await window.api.restaurarBackupManual()

    if (!resultado.ok) {
      return resultado
    }

    await recargarIntervenciones()

    return {
      ok: true,
      message: 'Backup restaurado correctamente.',
      path: resultado.path,
    }
  }

  // Restaura únicamente el período activo y recarga intervenciones.
  async function restaurarPeriodoActual() {
    const resultado = await window.api.restaurarPeriodoManual(periodoActivo)

    if (!resultado.ok) {
      return resultado
    }

    await recargarIntervenciones()

    return {
      ok: true,
      message: 'Período restaurado correctamente.',
      path: resultado.path,
    }
  }

  // API pública que consume el resto de la aplicación.
  return {
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  }
}