/*
  useTopbarActions

  Define las acciones disparadas desde el menu superior:
  exportaciones, importaciones, backups, restauraciones, configuracion de
  carpeta de backups y apertura del dialogo Acerca de.
*/

import { exportarExcelPeriodo } from '@services/exportExcel'
import { exportarGeoJSONPeriodo } from '@services/exportGeoJSON'
import { exportarKml } from '@services/exportKML'
import { exportarShpPeriodo } from '@services/exportSHP'
import { importarArchivoGIS } from '@services/importGIS'
import {
  contarIntervencionesExportables,
} from '@services/intervencionesGeoJSON'

export function useTopbarActions({
  periodoActivo,
  intervencionesDelPeriodo,
  intervencionesFiltradas,
  guardarIntervencionEnDB,
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

  function obtenerResumenExportacion() {
    const total =
      intervencionesParaExportar.length

    const exportables =
      contarIntervencionesExportables(
        intervencionesParaExportar
      )

    return {
      total,
      exportables,
      omitidas: total - exportables,
    }
  }

  function mensajeExportacion(
    formato,
    resultado
  ) {
    if (!resultado.ok) {
      return `No hay intervenciones con geometria valida para exportar en ${formato}.`
    }

    if (resultado.omitidas > 0) {
      return `${formato} exportado: ${resultado.exportadas} intervenciones. Omitidas sin geometria valida: ${resultado.omitidas}.`
    }

    return `${formato} exportado correctamente.`
  }

  function confirmarExportacion({
    formato,
    requiereGeometria = true,
    onConfirmar,
  }) {
    const resumen =
      obtenerResumenExportacion()

    if (!resumen.total) {
      mostrarToast(
        'No hay intervenciones para exportar con los filtros actuales.',
        'error'
      )
      return
    }

    if (
      requiereGeometria &&
      !resumen.exportables
    ) {
      mostrarToast(
        `No hay intervenciones con geometria valida para exportar en ${formato}.`,
        'error'
      )
      return
    }

    confirmar({
      titulo: `Exportar ${formato}`,
      mensaje:
        `Se exportaran ${resumen.total} intervenciones filtradas del periodo ${periodoActivo}.`,
      detalle: requiereGeometria
        ? `${resumen.exportables} tienen geometria valida. ${resumen.omitidas} se omitiran por no tener geometria exportable.`
        : 'La exportacion usara exactamente los filtros activos.',
      textoConfirmar: `Exportar ${formato}`,
      textoCancelar: 'Cancelar',
      onConfirmar,
    })
  }

  function exportarKmlActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'KML',
      onConfirmar: () => {
        const ok = exportarKml(
          intervencionesParaExportar
        )

        mostrarToast(
          ok
            ? 'KML exportado correctamente.'
            : 'No hay intervenciones para exportar con los filtros actuales.',
          ok ? 'success' : 'error'
        )
      },
    })
  }

  function exportarExcelActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'Excel',
      requiereGeometria: false,
      onConfirmar: () => {
        const ok = exportarExcelPeriodo(
          intervencionesParaExportar,
          periodoActivo
        )

        mostrarToast(
          ok
            ? 'Excel exportado correctamente.'
            : 'No hay intervenciones para exportar con los filtros actuales.',
          ok ? 'success' : 'error'
        )
      },
    })
  }

  function exportarGeoJSONActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'GeoJSON',
      onConfirmar: () => {
        const resultado =
          exportarGeoJSONPeriodo(
            intervencionesParaExportar,
            periodoActivo
          )

        mostrarToast(
          mensajeExportacion(
            'GeoJSON',
            resultado
          ),
          resultado.ok ? 'success' : 'error'
        )
      },
    })
  }

  async function exportarShpActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'SHP',
      onConfirmar: async () => {
        try {
          const resultado =
            await exportarShpPeriodo(
              intervencionesParaExportar,
              periodoActivo
            )

          mostrarToast(
            mensajeExportacion(
              'SHP',
              resultado
            ),
            resultado.ok ? 'success' : 'error'
          )
        } catch (error) {
          console.error(
            'Error al exportar SHP:',
            error
          )

          mostrarToast(
            'No se pudo generar el archivo SHP.',
            'error'
          )
        }
      },
    })
  }

  async function importarArchivoGISActual(file) {
    setMenuAbierto(false)

    if (!file) return

    try {
      const resultado =
        await importarArchivoGIS(
          file,
          periodoActivo
        )

      if (!resultado.importables) {
        mostrarToast(
          'El archivo no contiene geometrías importables.',
          'error'
        )
        return
      }

      confirmar({
        titulo: 'Importar archivo GIS',
        mensaje:
          `Se importaran ${resultado.importables} intervenciones al periodo ${periodoActivo}.`,
        detalle:
          `${resultado.omitidas} geometrías se omitiran por no ser compatibles o no tener coordenadas validas.`,
        textoConfirmar: 'Importar',
        textoCancelar: 'Cancelar',
        onConfirmar: async () => {
          for (const intervencion of resultado.intervenciones) {
            await guardarIntervencionEnDB(intervencion)
          }

          mostrarToast(
            `Importacion completa: ${resultado.importables} intervenciones.`,
            'success'
          )
        },
      })
    } catch (error) {
      console.error(
        'Error al importar archivo GIS:',
        error
      )

      mostrarToast(
        'No se pudo importar el archivo GIS.',
        'error'
      )
    }
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
        'Se reemplazara la base actual por el backup seleccionado.',
      detalle:
        'Esta accion sobrescribira la informacion actual.',
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
      titulo: 'Restaurar periodo',
      mensaje: `Se restauraran unicamente las intervenciones del periodo ${periodoActivo}.`,
      detalle: 'Los demas periodos no se modificaran.',
      textoConfirmar: 'Restaurar periodo',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        const resultado = await restaurarPeriodoActual()

        mostrarToast(
          resultado?.message ||
            'Periodo restaurado correctamente.',
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
    exportarGeoJSONActual,
    exportarShpActual,
    importarArchivoGISActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  }
}
