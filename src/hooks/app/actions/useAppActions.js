/*
  useAppActions

  Define acciones principales que conectan navegación visual, edición de
  intervenciones y protección ante cambios sin guardar.

  Este hook no persiste datos directamente; coordina estado de UI y confirma
  operaciones que podrían descartar cambios.
*/

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
  // Fuerza el foco visual sobre una intervención en el mapa.
  // __focusKey permite reenfocar incluso si se selecciona la misma intervención dos veces.
  function manejarEnfocarIntervencion(
    intervencion
  ) {
    setIntervencionEnfocada({
      ...intervencion,
      __focusKey: Date.now(),
    })
  }

  // Abre el formulario lateral en modo edición y enfoca la intervención en el mapa.
  function manejarEditarIntervencion(
    intervencion
  ) {
    manejarEnfocarIntervencion(
      intervencion
    )

    setSidebarAbierto(true)

    if (window.innerWidth <= 1024) {
      setAssetsPanelAbierto(false)
    }

    editarIntervencion(intervencion)
  }

  // Cancela la edición actual. Si hay cambios pendientes, solicita confirmación.
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

  // Cambia el período activo. Si hay cambios sin guardar, protege la operación.
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
