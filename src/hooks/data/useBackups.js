export function useBackups({
  periodoActivo,
  recargarIntervenciones,
}) {
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

  return {
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  }
}