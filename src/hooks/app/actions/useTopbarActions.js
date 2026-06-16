/*
  useTopbarActions

  Define las acciones disparadas desde el menu superior:
  exportaciones, importaciones, backups, restauraciones, configuracion de
  carpeta de backups y apertura del dialogo Acerca de.
*/

import {
  contarIntervencionesExportables,
} from '@services/intervencionesGeoJSON'
import {
  analizarCalidadIntervencionesAsync,
} from '@services/dataQualityWorker'
import { logger } from '@services/logger'

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

  function contarPorGeometria(intervenciones = []) {
    return intervenciones.reduce(
      (acumulado, intervencion) => {
        const tipo =
          intervencion.geometriaTipo || 'Sin geometria'

        acumulado[tipo] =
          (acumulado[tipo] || 0) + 1

        return acumulado
      },
      {}
    )
  }

  function formatearConteoGeometrias(conteo) {
    return Object.entries(conteo)
      .map(([tipo, total]) => `${tipo}: ${total}`)
      .join(' | ')
  }

  function primerasIntervencionesPreview(
    intervenciones = []
  ) {
    return intervenciones
      .slice(0, 5)
      .map((intervencion, index) => {
        const nombre =
          intervencion.nombre ||
          intervencion.obra ||
          'Sin nombre'

        const barrio =
          intervencion.barrio || 'Sin barrio'

        return `${index + 1}. ${nombre} - ${barrio}`
      })
      .join('\n')
  }

  function detalleImportacionGIS(resultado) {
    const geometrias =
      formatearConteoGeometrias(
        contarPorGeometria(
          resultado.intervenciones
        )
      )

    const primeras =
      primerasIntervencionesPreview(
        resultado.intervenciones
      )

    return [
      `Periodo destino: ${periodoActivo}`,
      `Registros leidos: ${resultado.total}`,
      `Importables: ${resultado.importables}`,
      `Omitidos: ${resultado.omitidas}`,
      geometrias
        ? `Geometrias: ${geometrias}`
        : '',
      primeras
        ? `Primeras intervenciones:\n${primeras}`
        : '',
      'Antes de importar se creara un backup preventivo.',
    ]
      .filter(Boolean)
      .join('\n\n')
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

  async function exportarShpActual() {
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

  async function importarArchivoGISActual(file) {
    setMenuAbierto(false)

    if (!file) return

    if (modoConsulta) {
      mostrarToast(
        'El modo consulta esta activo. Desactivalo para importar datos.',
        'error'
      )
      return
    }

    try {
      const { importarArchivoGIS } =
        await import('@services/importGIS')

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
        titulo: 'Vista previa importacion GIS',
        mensaje:
          `Se importaran ${resultado.importables} intervenciones desde ${file.name}.`,
        detalle: detalleImportacionGIS(resultado),
        textoConfirmar: 'Importar',
        textoCancelar: 'Cancelar',
        onConfirmar: async () => {
          await window.api.crearBackupPreventivo(
            'importacion-gis'
          )

          if (guardarIntervencionesMasivoEnDB) {
            await guardarIntervencionesMasivoEnDB(
              resultado.intervenciones
            )
          } else {
            for (const intervencion of resultado.intervenciones) {
              await guardarIntervencionEnDB(intervencion)
            }
          }

          mostrarToast(
            `Importacion completa: ${resultado.importables} intervenciones.`,
            'success'
          )
        },
      })
    } catch (error) {
      logger.error(
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

    if (modoConsulta) {
      mostrarToast(
        'El modo consulta esta activo. Desactivalo para restaurar backups.',
        'error'
      )
      return
    }

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

    if (modoConsulta) {
      mostrarToast(
        'El modo consulta esta activo. Desactivalo para restaurar periodos.',
        'error'
      )
      return
    }

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
    exportarInformePDFActual,
    importarArchivoGISActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  }
}
