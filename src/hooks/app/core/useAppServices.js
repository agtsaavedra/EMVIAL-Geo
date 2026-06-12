/*
  useAppServices

  Hook controlador principal de la aplicación.

  Su responsabilidad es ensamblar los distintos bloques de la app:
  - estado visual global
  - datos persistentes y período activo
  - formulario, geocoding e imagen guía
  - acciones globales y efectos de teclado/cierre
  - props finales para los componentes de layout

  Este hook evita que App.jsx vuelva a crecer como un archivo monolítico.
  No debería contener lógica de bajo nivel; solamente coordinar hooks más
  específicos y devolver una API limpia para el componente raíz.
*/

import { useAppUI } from '@hooks/app/core/useAppUI'
import { useAppData } from '@hooks/app/core/useAppData'
import { useAppForm } from '@hooks/app/core/useAppForm'
import { useAppActionsBundle } from '@hooks/app/core/useAppActionsBundle'
import { useAppComponentProps } from '@hooks/app/useAppComponentProps'
import { useEffect } from 'react'

export function useAppServices() {
  // =====================================================
  // UI GLOBAL
  // =====================================================

  const appUI = useAppUI()

  const {
    toast,
    mostrarToast,

    dialogo,
    confirmar,
    cerrarDialogo,

    mostrarSplash,

    busquedaDebounced,

    dataQualityAbierto,
    setDataQualityAbierto,

    modoOscuro,
    setModoOscuro,

    busqueda,
    setBusqueda,

    sugerencias,
    setSugerencias,

    buscandoDireccion,
    setBuscandoDireccion,

    puntoSeleccionado,
    setPuntoSeleccionado,

    barrioSeleccionado,
    setBarrioSeleccionado,

    mostrarBarrios,
    setMostrarBarrios,

    menuAbierto,
    setMenuAbierto,

    filtroObra,
    setFiltroObra,

    filtroEstado,
    setFiltroEstado,

    intervencionEnfocada,
    setIntervencionEnfocada,

    modoDibujo,
    setModoDibujo,

    modoConsulta,
    setModoConsulta,

    sidebarAbierto,
    setSidebarAbierto,

    assetsPanelAbierto,
    setAssetsPanelAbierto,

    intervencionHoverId,
    setIntervencionHoverId,
  } = appUI

  // =====================================================
  // DATOS / PERÍODO / BACKUPS
  // =====================================================

  const appData = useAppData({
    busquedaDebounced,
    filtroObra,
    filtroEstado,
  })

  const {
    intervencionEditandoId,
    setIntervencionEditandoId,

    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    eliminarIntervencion,
    restaurarIntervencion,
    duplicarIntervencion,

    periodoActivo,
    setPeriodoActivo,

    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,

    intervencionesDelPeriodo,
    intervencionesFiltradas,
  } = appData

  // =====================================================
  // FORMULARIO / GEOCODING / GUÍA
  // =====================================================

  const appForm = useAppForm({
    periodoActivo,
    guardarIntervencionEnDB,

    setIntervencionEditandoId,
    setPuntoSeleccionado,
    setBarrioSeleccionado,

    setFiltroObra,
    setFiltroEstado,

    setSugerencias,
    setBuscandoDireccion,

    mostrarToast,
  })

  const {
    form,
    setForm,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,

    guideOverlay,
    guideOverlayConAcciones,

    obtenerDireccion,
    buscarDireccion,
    seleccionarSugerencia,
  } = appForm

  useEffect(() => {
    if (modoConsulta && modoDibujo) {
      setModoDibujo(false)
    }
  }, [
    modoConsulta,
    modoDibujo,
    setModoDibujo,
  ])

  // =====================================================
  // ACCIONES DE APP
  // =====================================================

  const appActions = useAppActionsBundle({
    confirmar,
    mostrarToast,

    setIntervencionEnfocada,
    setSidebarAbierto,
    setAssetsPanelAbierto,
    setMenuAbierto,

    modoDibujo,
    setModoDibujo,

    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,

    periodoActivo,
    setPeriodoActivo,

    intervencionesDelPeriodo,
    intervencionesFiltradas,
    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    eliminarIntervencion,
    restaurarIntervencion,
    duplicarIntervencion,
    modoConsulta,

    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  })

  const {
    aboutAbierto,
    estadoApp,
    estadoGeocoding,
    cerrarAbout,
    limpiarCacheGeocoding,

    manejarEnfocarIntervencion,
    manejarEditarIntervencion,
    manejarCancelarEdicion,
    manejarCambioPeriodo,

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

    eliminarIntervencionProtegida,
    duplicarIntervencionProtegida,
  } = appActions

  function abrirDataQuality() {
    setDataQualityAbierto(true)
    setMenuAbierto(false)
  }

  function cerrarDataQuality() {
    setDataQualityAbierto(false)
  }

  function obtenerIntervencionDesdeIssue(issue) {
    if (!issue?.id) return null

    return intervencionesFiltradas.find(
      (intervencion) =>
        intervencion.id === issue.id
    )
  }

  function enfocarIssueDataQuality(issue) {
    const intervencion =
      obtenerIntervencionDesdeIssue(issue)

    if (!intervencion) {
      mostrarToast(
        'No se encontro la intervencion seleccionada.',
        'error'
      )
      return
    }

    manejarEnfocarIntervencion(intervencion)
    setAssetsPanelAbierto(true)
    setDataQualityAbierto(false)
  }

  function editarIssueDataQuality(issue) {
    const intervencion =
      obtenerIntervencionDesdeIssue(issue)

    if (!intervencion) {
      mostrarToast(
        'No se encontro la intervencion seleccionada.',
        'error'
      )
      return
    }

    manejarEditarIntervencion(intervencion)
    setDataQualityAbierto(false)
  }

  // =====================================================
  // PROPS DE COMPONENTES
  // =====================================================

  const {
    topbarProps,
    sidebarProps,
    mapProps,
    assetsPanelProps,
  } = useAppComponentProps({
    periodoActivo,
    manejarCambioPeriodo,

    filtroObra,
    setFiltroObra,

    filtroEstado,
    setFiltroEstado,

    busqueda,
    setBusqueda,

    modoOscuro,
    setModoOscuro,

    menuAbierto,
    setMenuAbierto,

    abrirAboutDesdeMenu,
    abrirDataQuality,

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

    cargarImagenGuia:
      guideOverlay.cargarImagenGuia,

    sidebarAbierto,
    setSidebarAbierto,

    form,
    setForm,
    manejarCambio,
    guardarIntervencion,

    buscarDireccion,
    sugerencias,
    buscandoDireccion,
    seleccionarSugerencia,

    intervencionEditandoId,
    manejarCancelarEdicion,
    hayCambiosSinGuardar,

    intervencionesFiltradas,

    puntoSeleccionado,
    setPuntoSeleccionado,

    obtenerDireccion,

    barrioSeleccionado,
    setBarrioSeleccionado,

    mostrarBarrios,
    setMostrarBarrios,

    manejarEditarIntervencion,
    intervencionEnfocada,

    modoDibujo,
    setModoDibujo,

    modoConsulta,
    setModoConsulta,

    manejarEnfocarIntervencion,

    assetsPanelAbierto,
    setAssetsPanelAbierto,

    intervencionHoverId,
    setIntervencionHoverId,

    guideOverlayConAcciones,

    eliminarIntervencionProtegida,
    duplicarIntervencionProtegida,
  })

  // =====================================================
  // API DEL CONTROLADOR PRINCIPAL
  // =====================================================

  // Ejecuta la acción confirmada por el usuario y luego cierra el diálogo global.
  function confirmarDialogoActual() {
    dialogo?.onConfirmar?.()
    cerrarDialogo()
  }

  return {
    modoOscuro,

    mostrarSplash,

    toast,

    dialogo,
    cerrarDialogo,
    confirmarDialogoActual,

    aboutAbierto,
    cerrarAbout,
    estadoApp,
    estadoGeocoding,
    limpiarCacheGeocoding,
    periodoActivo,

    dataQualityAbierto,
    cerrarDataQuality,
    enfocarIssueDataQuality,
    editarIssueDataQuality,
    intervencionesFiltradas,

    topbarProps,
    sidebarProps,
    mapProps,
    assetsPanelProps,
  }
}
