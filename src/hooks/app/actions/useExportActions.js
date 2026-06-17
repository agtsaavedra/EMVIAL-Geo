import {
  contarIntervencionesExportables,
} from '@services/intervencionesGeoJSON'
import {
  analizarCalidadIntervencionesAsync,
} from '@services/dataQualityWorker'
import { logger } from '@services/logger'
import {
  mensajeExportacion,
} from './topbarActionHelpers.mjs'

export function useExportActions({
  periodoActivo,
  intervencionesParaExportar,
  setMenuAbierto,
  mostrarToast,
  confirmar,
}) {
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

  async function detalleCalidadExportacion({
    formato,
    resumen,
    requiereGeometria,
  }) {
    const reporte =
      await analizarCalidadIntervencionesAsync(
        intervencionesParaExportar
      )

    const detalleBase = requiereGeometria
      ? `${resumen.exportables} tienen geometria valida. ${resumen.omitidas} se omitiran por no tener geometria exportable.`
      : 'La exportacion usara exactamente los filtros activos.'

    if (!reporte.totalIssues) {
      return {
        tieneIssues: false,
        detalle: detalleBase,
      }
    }

    const primeras = reporte.issues
      .slice(0, 4)
      .map(
        (issue) =>
          `- ${issue.severidad.toUpperCase()}: ${issue.nombre} (${issue.mensaje})`
      )
      .join('\n')

    return {
      tieneIssues: true,
      detalle: [
        detalleBase,
        `Control de calidad para ${formato}: ${reporte.totalIssues} observaciones (${reporte.altas} altas, ${reporte.medias} medias, ${reporte.bajas} bajas).`,
        primeras
          ? `Primeras observaciones:\n${primeras}`
          : '',
        'Podes exportar igual, pero conviene revisar Calidad de datos si el archivo se va a entregar.',
      ]
        .filter(Boolean)
        .join('\n\n'),
    }
  }

  async function confirmarExportacion({
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

    const calidad =
      await detalleCalidadExportacion({
        formato,
        resumen,
        requiereGeometria,
      })

    confirmar({
      titulo: `Exportar ${formato}`,
      mensaje:
        `Se exportaran ${resumen.total} intervenciones filtradas del periodo ${periodoActivo}.`,
      detalle: calidad.detalle,
      textoConfirmar: calidad.tieneIssues
        ? 'Exportar igual'
        : `Exportar ${formato}`,
      textoCancelar: 'Cancelar',
      onConfirmar,
    })
  }

  function exportarKmlActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'KML',
      onConfirmar: async () => {
        const { exportarKml } =
          await import('@services/exportKML')

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
      onConfirmar: async () => {
        const { exportarExcelPeriodo } =
          await import('@services/exportExcel')

        const ok = await exportarExcelPeriodo(
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
      onConfirmar: async () => {
        const { exportarGeoJSONPeriodo } =
          await import('@services/exportGeoJSON')

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

  function exportarShpActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'SHP',
      onConfirmar: async () => {
        try {
          const { exportarShpPeriodo } =
            await import('@services/exportSHP')

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
          logger.error(
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

  function exportarInformePDFActual() {
    setMenuAbierto(false)

    confirmarExportacion({
      formato: 'Informe PDF',
      requiereGeometria: false,
      onConfirmar: async () => {
        const { exportarInformePeriodoPDF } =
          await import('@services/exportPeriodoPDF')

        const ok = exportarInformePeriodoPDF(
          intervencionesParaExportar,
          periodoActivo,
          {
            incluirCoordenadas: true,
            incluirObservaciones: true,
          }
        )

        mostrarToast(
          ok
            ? 'Informe abierto. Usa Descargar PDF desde la vista previa.'
            : 'No hay intervenciones para informar con los filtros actuales.',
          ok ? 'success' : 'error'
        )
      },
    })
  }

  return {
    exportarKmlActual,
    exportarExcelActual,
    exportarGeoJSONActual,
    exportarShpActual,
    exportarInformePDFActual,
  }
}
