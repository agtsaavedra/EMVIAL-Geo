/*
  useTopbarActions

  Define las acciones disparadas desde el menú superior:
  exportaciones, backups, restauraciones, configuración de carpeta de backups
  y apertura del diálogo Acerca de.

  Mantiene al componente Topbar libre de lógica de negocio.
*/

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
  // Exporta las intervenciones del período activo en formato KML.
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

  // Exporta las intervenciones del período activo a Excel.
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

  // Crea un backup manual desde el menú superior.
  async function crearBackupActual() {
    setMenuAbierto(false)

    const resultado = await crearBackup()

    mostrarToast(
      resultado?.message || 'Backup creado correctamente.',
      resultado?.ok === false ? 'error' : 'success'
    )
  }

  // Solicita confirmación y restaura una base completa desde backup.
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

  // Solicita confirmación y restaura solo el período activo.
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

  // Abre en el sistema operativo la carpeta activa de backups.
  function abrirCarpetaBackups() {
    setMenuAbierto(false)
    window.api.abrirCarpetaBackups()
  }

  // Permite elegir una nueva carpeta de backups desde Electron.
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

  // Cierra el menú hamburguesa y abre el diálogo Acerca de.
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