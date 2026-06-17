import { logger } from '@services/logger'
import topbarActionHelpers from './topbarActionHelpers.cjs'

const {
  detalleImportacionGIS,
} = topbarActionHelpers

export function useImportActions({
  periodoActivo,
  guardarIntervencionEnDB,
  guardarIntervencionesMasivoEnDB,
  modoConsulta,
  setMenuAbierto,
  mostrarToast,
  confirmar,
}) {
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
        detalle: detalleImportacionGIS({
          periodoActivo,
          resultado,
        }),
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

  return {
    importarArchivoGISActual,
  }
}
