/*
  useAppComponentProps

  Hook agregador de props para componentes principales.

  Su objetivo es mantener App/useAppServices limpios, delegando aquí la
  construcción de los objetos de props que consumen Topbar, Sidebar, MapView
  y AssetsPanel.
*/

import { useMapProps } from '@hooks/props/useMapProps'
import { useTopbarProps } from '@hooks/props/useTopbarProps'
import { useSidebarProps } from '@hooks/props/useSidebarProps'
import { useAssetsPanelProps } from '@hooks/props/useAssetsPanelProps'

export function useAppComponentProps({
  // Topbar
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

  exportarKmlActual,
  exportarExcelActual,
  exportarGeoJSONActual,
  exportarShpActual,

  crearBackupActual,
  restaurarBackupActual,
  restaurarPeriodoActualProtegido,

  abrirCarpetaBackups,
  configurarCarpetaBackups,

  cargarImagenGuia,

  // Sidebar
  sidebarAbierto,
  setSidebarAbierto,

  form,
  manejarCambio,
  guardarIntervencion,

  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,

  intervencionEditandoId,
  manejarCancelarEdicion,
  hayCambiosSinGuardar,

  // Map
  setForm,

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

  manejarEnfocarIntervencion,

  assetsPanelAbierto,

  intervencionHoverId,

  guideOverlayConAcciones,

  // Assets panel
  eliminarIntervencionProtegida,
  setAssetsPanelAbierto,
  setIntervencionHoverId,
}) {
  const topbarProps = useTopbarProps({
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

    exportarKmlActual,
    exportarExcelActual,
    exportarGeoJSONActual,
    exportarShpActual,

    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,

    abrirCarpetaBackups,
    configurarCarpetaBackups,

    cargarImagenGuia,
  })

  const sidebarProps = useSidebarProps({
    sidebarAbierto,
    setSidebarAbierto,

    form,
    manejarCambio,
    guardarIntervencion,

    buscarDireccion,
    sugerencias,
    buscandoDireccion,
    seleccionarSugerencia,

    intervencionEditandoId,
    manejarCancelarEdicion,
    hayCambiosSinGuardar,
  })

  const mapProps = useMapProps({
    form,
    setForm,

    intervencionesFiltradas,
    intervencionEditandoId,

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

    sidebarAbierto,
    manejarEnfocarIntervencion,

    assetsPanelAbierto,

    intervencionHoverId,

    guideOverlay: guideOverlayConAcciones,
  })

  const assetsPanelProps = useAssetsPanelProps({
    intervencionesFiltradas,

    manejarEditarIntervencion,
    eliminarIntervencionProtegida,
    manejarEnfocarIntervencion,

    assetsPanelAbierto,
    setAssetsPanelAbierto,

    setIntervencionHoverId,
  })

  return {
    topbarProps,
    sidebarProps,
    mapProps,
    assetsPanelProps,
  }
}
