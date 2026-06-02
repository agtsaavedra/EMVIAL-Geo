import './App.css'
import { useEffect, useState } from 'react'

import Sidebar from '@components/layout/Sidebar'
import AssetsPanel from '@components/layout/AssetsPanel'
import Topbar from '@components/layout/Topbar'
import MapView from '@components/map/MapView'

import Toast from '@components/common/Toast'
import ConfirmDialog from '@components/common/ConfirmDialog'
import AboutDialog from '@components/common/AboutDialog'
import AppSplash from '@components/common/AppSplash'

import { useToast } from '@hooks/ui/useToast'
import { useConfirmDialog } from '@hooks/ui/useConfirmDialog'
import { useUIState } from '@hooks/ui/useUIState'
import { useSplashScreen } from '@hooks/ui/useSplashScreen'
import { useDebouncedValue } from '@hooks/ui/useDebouncedValue'

import { useIntervenciones } from '@hooks/data/useIntervenciones'
import { usePeriodo } from '@hooks/data/usePeriodo'
import { useBackups } from '@hooks/data/useBackups'
import { useFiltrosIntervenciones } from '@hooks/data/useFiltrosIntervenciones'

import { useFormularioIntervencion } from '@hooks/form/useFormularioIntervencion'
import { useGeocoding } from '@hooks/form/useGeocoding'

import { useKeyboardShortcuts } from '@hooks/app/useKeyboardShortcuts'
import { useAppCloseProtection } from '@hooks/app/useAppCloseProtection'
import { useAboutDialog } from '@hooks/app/useAboutDialog'
import { useAppActions } from '@hooks/app/useAppActions'
import { useTopbarActions } from '@hooks/app/useTopbarActions'
import { useAssetActions } from '@hooks/app/useAssetActions'

import { useMapProps } from '@hooks/props/useMapProps'
import { useTopbarProps } from '@hooks/props/useTopbarProps'
import { useSidebarProps } from '@hooks/props/useSidebarProps'
import { useAssetsPanelProps } from '@hooks/props/useAssetsPanelProps'
import { useGuideOverlay } from '@hooks/map/useGuideOverlay'



function App() {
  // =====================================================
  // UI GLOBAL
  // =====================================================

  const { toast, mostrarToast } = useToast()

  const {
    dialogo,
    confirmar,
    cerrarDialogo,
  } = useConfirmDialog()

  // =====================================================
  // DATOS PRINCIPALES / INTERVENCIONES
  // =====================================================

  const {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    eliminarIntervencion,
    recargarIntervenciones,
    restaurarIntervencion,
  } = useIntervenciones()

  // =====================================================
  // ESTADO VISUAL GENERAL
  // =====================================================


  const {
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

    sidebarAbierto,
    setSidebarAbierto,

    assetsPanelAbierto,
    setAssetsPanelAbierto,

    intervencionHoverId,
    setIntervencionHoverId,
  } = useUIState()


  const busquedaDebounced =
    useDebouncedValue(busqueda, 220)

  const guideOverlay =
    useGuideOverlay()


  // =====================================================
  // PERÍODO ACTIVO
  // usePeriodo:
  // - mantiene el período activo
  // - recuerda el último período usado con localStorage
  // =====================================================

  const {
    periodoActivo,
    setPeriodoActivo,
  } = usePeriodo()

  // =====================================================
  // BACKUPS
  // useBackups:
  // - crear backup
  // - restaurar backup completo
  // - restaurar período actual
  // =====================================================

  const {
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  } = useBackups({
    periodoActivo,
    recargarIntervenciones,
  })

  // =====================================================
  // FORMULARIO DE INTERVENCIÓN
  // useFormularioIntervencion:
  // - form
  // - guardar / editar / cancelar
  // - dirty state: hayCambiosSinGuardar
  // =====================================================

  const {
    form,
    setForm,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,
  } = useFormularioIntervencion({
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

  // =====================================================
  // GEOCODING
  // useGeocoding:
  // - buscar dirección
  // - obtener dirección por lat/lon
  // - seleccionar sugerencia
  // =====================================================

  const {
    obtenerDireccion,
    buscarDireccion,
    seleccionarSugerencia,
  } = useGeocoding({
    form,
    setForm,
    setPuntoSeleccionado,
    setSugerencias,
    setBuscandoDireccion,
    mostrarToast,
  })

  // =====================================================
  // FILTROS / DATOS DERIVADOS
  // useFiltrosIntervenciones:
  // - intervenciones del período
  // - intervenciones filtradas
  // - barrios disponibles
  // =====================================================

  const {
    intervencionesDelPeriodo,
    intervencionesFiltradas,

  } = useFiltrosIntervenciones({
    intervenciones,
    periodoActivo,
    busqueda: busquedaDebounced,
    filtroObra,
    filtroEstado,
  })

  // =====================================================
  // ABOUT / ACERCA DE
  // useAboutDialog:
  // - abre/cierra modal About
  // - obtiene estado de app desde Electron
  // =====================================================

  const {
    aboutAbierto,
    estadoApp,
    abrirAbout,
    cerrarAbout,
  } = useAboutDialog()

  // =====================================================
  // ACCIONES PRINCIPALES DE APP
  // useAppActions:
  // - enfocar intervención
  // - editar intervención
  // - cancelar edición protegido
  // - cambiar período protegido
  // =====================================================

  const {
    manejarEnfocarIntervencion,
    manejarEditarIntervencion,
    manejarCancelarEdicion,
    manejarCambioPeriodo,
  } = useAppActions({
    setIntervencionEnfocada,
    setSidebarAbierto,
    setAssetsPanelAbierto,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,
    confirmar,
    setPeriodoActivo,
  })

  // =====================================================
  // ACCIONES DEL TOPBAR
  // useTopbarActions:
  // - exportar Excel
  // - exportar KML
  // - crear/restaurar backups
  // - abrir About desde menú
  // =====================================================

  const {
    exportarKmlActual,
    exportarExcelActual,
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  } = useTopbarActions({
    periodoActivo,
    intervencionesDelPeriodo,
    setMenuAbierto,
    mostrarToast,
    confirmar,
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
    abrirAbout,
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

    guideOverlay,
  })

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

    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,

    abrirCarpetaBackups,
    configurarCarpetaBackups,

    cargarImagenGuia:
      guideOverlay.cargarImagenGuia,
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


  // =====================================================
  // ACCIONES DEL PANEL DE INTERVENCIONES
  // useAssetActions:
  // - eliminar intervención con modal de confirmación
  // =====================================================

  const {
    eliminarIntervencionProtegida,
  } = useAssetActions({
    confirmar,
    eliminarIntervencion,
    mostrarToast,
    restaurarIntervencion,
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

  // =====================================================
  // ATAJOS DE TECLADO
  // useKeyboardShortcuts:
  // - Ctrl + S guardar
  // - Ctrl + F buscar
  // - Ctrl + D modo dibujo
  // - Esc salir de modo dibujo
  // =====================================================

  useKeyboardShortcuts({
    modoDibujo,
    setModoDibujo,
    mostrarToast,
  })

  // =====================================================
  // PROTECCIÓN DE CIERRE
  // useAppCloseProtection:
  // - intercepta cierre de ventana Electron
  // - muestra modal si hay cambios sin guardar
  // =====================================================

  useAppCloseProtection({
    hayCambiosSinGuardar,
    confirmar,
  })

  // =====================================================
  // RENDER
  // =====================================================
  const { mostrarSplash } =
    useSplashScreen()

  return (
    <>
      {mostrarSplash && <AppSplash />}
      <div className={`app ${modoOscuro ? 'dark' : ''}`}>
        <Sidebar {...sidebarProps} />

        <main className="main">
          <Topbar {...topbarProps} />

          <section className="content">
            <MapView {...mapProps} />

            <AssetsPanel {...assetsPanelProps} />
          </section>
        </main>

        <Toast toast={toast} />

        <ConfirmDialog
          abierto={Boolean(dialogo)}
          titulo={dialogo?.titulo}
          mensaje={dialogo?.mensaje}
          detalle={dialogo?.detalle}
          textoConfirmar={dialogo?.textoConfirmar}
          textoCancelar={dialogo?.textoCancelar}
          danger={dialogo?.danger}
          onCancelar={cerrarDialogo}
          onConfirmar={() => {
            dialogo?.onConfirmar?.()
            cerrarDialogo()
          }}
        />

        <AboutDialog
          abierto={aboutAbierto}
          onCerrar={cerrarAbout}
          estadoApp={estadoApp}
          periodoActivo={periodoActivo}
        />
      </div>
    </>
  )
}

export default App
