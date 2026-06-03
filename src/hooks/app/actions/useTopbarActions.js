import { exportarExcelPeriodo } from '@services/exportExcel'
import { exportarKml } from '@services/exportKML'

export function useTopbarActions({
  periodoActivo,
  intervencionesDelPeriodo,
  setMenuAbierto,
  mostrarToast,
  confirmar,
  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,
  abrirAbout,
}) {
  function exportarKmlActual() {
    setMenuAbierto(false)

    const ok = exportarKml(intervencionesDelPeriodo)

    mostrarToast(
      ok
        ? 'KML exportado correctamente.'
        : 'No hay intervenciones para exportar en este período.',
      ok ? 'success' : 'error'
    )
  }

  function exportarExcelActual() {
    setMenuAbierto(false)

    const ok = exportarExcelPeriodo(
      intervencionesDelPeriodo,
      periodoActivo
    )

    mostrarToast(
      ok
        ? 'Excel exportado correctamente.'
        : 'No hay intervenciones para exportar en este período.',
      ok ? 'success' : 'error'
    )
  }

  async function crearBackupActual() {
    setMenuAbierto(false)

    const resultado = await crearBackup()

    mostrarToast(
      resultado?.message || 'Backup creado correctamente.',
      resultado?.ok === false ? 'error' : 'success'
    )
  }

  function restaurarBackupActual() {
    setMenuAbierto(false)

    confirmar({
      titulo: 'Restaurar backup',
      mensaje:
        'Se reemplazará la base actual por el backup seleccionado.',
      detalle:
        'Esta acción sobrescribirá la información actual.',
      textoConfirmar: 'Restaurar',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        const resultado = await restaurarBackup()

        mostrarToast(
          resultado?.message ||
            'Backup restaurado correctamente.',
          resultado?.ok === false ? 'error' : 'success'
        )
      },
    })
  }

  function restaurarPeriodoActualProtegido() {
    setMenuAbierto(false)

    confirmar({
      titulo: 'Restaurar período',
      mensaje: `Se restaurarán únicamente las intervenciones del período ${periodoActivo}.`,
      detalle: 'Los demás períodos no se modificarán.',
      textoConfirmar: 'Restaurar período',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        const resultado = await restaurarPeriodoActual()

        mostrarToast(
          resultado?.message ||
            'Período restaurado correctamente.',
          resultado?.ok === false ? 'error' : 'success'
        )
      },
    })
  }

  function abrirCarpetaBackups() {
    setMenuAbierto(false)
    window.api.abrirCarpetaBackups()
  }

  async function configurarCarpetaBackups() {
    setMenuAbierto(false)

    const resultado =
      await window.api.configurarCarpetaBackups()

    mostrarToast(
      resultado?.message ||
        'Carpeta de backups configurada.',
      resultado?.ok ? 'success' : 'error'
    )
  }

  function abrirAboutDesdeMenu() {
    setMenuAbierto(false)
    abrirAbout()
  }

  return {
    exportarKmlActual,
    exportarExcelActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  }
}