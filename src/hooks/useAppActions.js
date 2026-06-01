export function useAppActions({
  setIntervencionEnfocada,
  setSidebarAbierto,
  setAssetsPanelAbierto,
  editarIntervencion,
  cancelarEdicion,
  hayCambiosSinGuardar,
  confirmar,
  setPeriodoActivo,
}) {
  function manejarEnfocarIntervencion(
    intervencion
  ) {
    setIntervencionEnfocada({
      ...intervencion,
      __focusKey: Date.now(),
    })
  }

  function manejarEditarIntervencion(
    intervencion
  ) {
    manejarEnfocarIntervencion(
      intervencion
    )

    setSidebarAbierto(true)

    if (window.innerWidth <= 1024) {
      setAssetsPanelAbierto(false)

      setTimeout(() => {
        window.dispatchEvent(
          new Event('resize')
        )
      }, 320)
    }

    editarIntervencion(intervencion)
  }

  function manejarCancelarEdicion() {
    if (!hayCambiosSinGuardar) {
      cancelarEdicion()
      return
    }

    confirmar({
      titulo: 'Descartar cambios',
      mensaje:
        'Hay cambios sin guardar en la intervención actual.',
      detalle:
        'Si continuás, se perderán las modificaciones realizadas.',
      textoConfirmar:
        'Descartar cambios',
      textoCancelar:
        'Seguir editando',
      danger: true,
      onConfirmar:
        cancelarEdicion,
    })
  }

  function manejarCambioPeriodo(
    nuevoPeriodo
  ) {
    if (!hayCambiosSinGuardar) {
      setPeriodoActivo(nuevoPeriodo)
      return
    }

    confirmar({
      titulo: 'Cambiar período',
      mensaje:
        'Hay cambios sin guardar en la intervención actual.',
      detalle:
        'Si cambiás de período, se descartarán las modificaciones no guardadas.',
      textoConfirmar:
        'Cambiar período',
      textoCancelar:
        'Seguir editando',
      danger: true,
      onConfirmar: () => {
        cancelarEdicion()
        setPeriodoActivo(
          nuevoPeriodo
        )
      },
    })
  }

  return {
    manejarEnfocarIntervencion,
    manejarEditarIntervencion,
    manejarCancelarEdicion,
    manejarCambioPeriodo,
  }
}