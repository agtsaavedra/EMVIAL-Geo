/*
  useAssetActions

  Define acciones del panel de intervenciones cargadas.

  Actualmente centraliza la eliminación protegida de intervenciones y el
  mecanismo de deshacer mediante toast con acción.
*/

export function useAssetActions({
  confirmar,
  eliminarIntervencion,
  restaurarIntervencion,
  duplicarIntervencion,
  mostrarToast,
}) {
  // Elimina una intervención con confirmación previa y opción de deshacer por toast.
  function eliminarIntervencionProtegida(
    intervencion
  ) {
    confirmar({
      titulo: 'Eliminar intervención',
      mensaje:
        'Se eliminará esta intervención del período actual.',
      detalle:
        'Vas a poder deshacer la acción durante unos segundos.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        try {
          const copiaEliminada = {
            ...intervencion,
          }

          await eliminarIntervencion(
            intervencion.id
          )

          mostrarToast(
            'Intervención eliminada.',
            'success',
            {
              accionTexto: 'Deshacer',
              duracion: 6500,
              onAccion: async () => {
                try {
                  await restaurarIntervencion(
                    copiaEliminada
                  )

                  mostrarToast(
                    'Intervención restaurada.',
                    'success'
                  )
                } catch {
                  mostrarToast(
                    'No se pudo restaurar la intervención.',
                    'error'
                  )
                }
              },
            }
          )
        } catch {
          mostrarToast(
            'No se pudo eliminar la intervención.',
            'error'
          )
        }
      },
    })
  }

  function duplicarIntervencionProtegida(
    intervencion
  ) {
    const nombre =
      intervencion.nombre ||
      intervencion.obra ||
      'esta intervencion'

    confirmar({
      titulo: 'Duplicar intervencion',
      mensaje:
        `Se creara una copia independiente de "${nombre}".`,
      detalle:
        'La nueva intervencion conservara obra, ubicacion, geometria, metricas y observaciones. Luego podras editarla sin afectar la original.',
      textoConfirmar: 'Duplicar',
      textoCancelar: 'Cancelar',
      onConfirmar: async () => {
        try {
          await duplicarIntervencion(intervencion)

          mostrarToast(
            'Intervencion duplicada.',
            'success'
          )
        } catch {
          mostrarToast(
            'No se pudo duplicar la intervencion.',
            'error'
          )
        }
      },
    })
  }

  return {
    eliminarIntervencionProtegida,
    duplicarIntervencionProtegida,
  }
}
