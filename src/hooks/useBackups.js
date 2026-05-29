export function useBackups({
  periodoActivo,
  recargarIntervenciones,
}) {
  async function crearBackup() {
    const resultado = await window.api.crearBackupManual(periodoActivo)

    if (resultado.ok) {
      alert('Backup creado correctamente.')
    }
  }

  async function restaurarBackup() {
    const confirmar = confirm(
      'Esto reemplazará la base actual por el backup seleccionado. ¿Continuar?'
    )

    if (!confirmar) return

    const resultado = await window.api.restaurarBackupManual()

    if (!resultado.ok) return

    await recargarIntervenciones()

    alert('Backup restaurado correctamente.')
  }

  async function restaurarPeriodoActual() {
    const resultado = await window.api.restaurarPeriodoManual(periodoActivo)

    if (!resultado.ok) return

    await recargarIntervenciones()

    alert('Periodo restaurado correctamente.')
  }

  return {
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  }
}