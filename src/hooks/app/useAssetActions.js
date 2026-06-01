export function useAssetActions({
  confirmar,
  eliminarIntervencion,
  restaurarIntervencion,
  mostrarToast,
}) {
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
