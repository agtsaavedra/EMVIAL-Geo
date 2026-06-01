export function useAssetActions({
  confirmar,
  eliminarIntervencion,
  mostrarToast,
}) {
  function eliminarIntervencionProtegida(intervencion) {
    confirmar({
      titulo: 'Eliminar intervención',
      mensaje:
        'Se eliminará esta intervención del período actual.',
      detalle: 'Esta acción no puede deshacerse.',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        try {
          await eliminarIntervencion(intervencion.id)

          mostrarToast(
            'Intervención eliminada correctamente.',
            'success'
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