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

  return {
    eliminarIntervencionProtegida,
  }
}
