import './App.css'

import Sidebar from './components/Sidebar.jsx'
import MapView from './components/map/MapView.jsx'
import AssetsPanel from './components/AssetsPanel'
import Topbar from './components/Topbar'
import Toast from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import AboutDialog from './components/AboutDialog'

import { useToast } from './hooks/useToast'
import { useConfirmDialog } from './hooks/useConfirmDialog'
import { useIntervenciones } from './hooks/useIntervenciones'
import { useUIState } from './hooks/useUIState'
import { usePeriodo } from './hooks/usePeriodo'
import { useBackups } from './hooks/useBackups'
import { useFormularioIntervencion } from './hooks/useFormularioIntervencion'
import { useGeocoding } from './hooks/useGeocoding'
import { useFiltrosIntervenciones } from './hooks/useFiltrosIntervenciones'

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useAppCloseProtection } from './hooks/useAppCloseProtection'
import { useAboutDialog } from './hooks/useAboutDialog'
import { useAppActions } from './hooks/useAppActions'
import { useTopbarActions } from './hooks/useTopbarActions'
import { useAssetActions } from './hooks/useAssetActions'

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
  } = useUIState()

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
    busqueda,
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

  return (
    <div className={`app ${modoOscuro ? 'dark' : ''}`}>
      <Sidebar
        abierto={sidebarAbierto}
        setAbierto={setSidebarAbierto}
        form={form}
        manejarCambio={manejarCambio}
        guardarIntervencion={guardarIntervencion}
        buscarDireccion={buscarDireccion}
        sugerencias={sugerencias}
        buscandoDireccion={buscandoDireccion}
        seleccionarSugerencia={seleccionarSugerencia}
        activoEditandoId={intervencionEditandoId}
        cancelarEdicion={manejarCancelarEdicion}
        hayCambiosSinGuardar={hayCambiosSinGuardar}
      />

      <main className="main">
        <Topbar
          periodoActivo={periodoActivo}
          setPeriodoActivo={manejarCambioPeriodo}
          filtroObra={filtroObra}
          setFiltroObra={setFiltroObra}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          modoOscuro={modoOscuro}
          setModoOscuro={setModoOscuro}
          menuAbierto={menuAbierto}
          setMenuAbierto={setMenuAbierto}
          abrirAbout={abrirAboutDesdeMenu}
          exportarKmlActual={exportarKmlActual}
          exportarExcelActual={exportarExcelActual}
          crearBackup={crearBackupActual}
          restaurarBackup={restaurarBackupActual}
          restaurarPeriodoActual={restaurarPeriodoActualProtegido}
          abrirCarpetaBackups={abrirCarpetaBackups}
          configurarCarpetaBackups={configurarCarpetaBackups}
        />

        <section className="content">
          <MapView
            form={form}
            intervencionesFiltradas={intervencionesFiltradas}
            intervencionEditandoId={intervencionEditandoId}
            puntoSeleccionado={puntoSeleccionado}
            setPuntoSeleccionado={setPuntoSeleccionado}
            setForm={setForm}
            obtenerDireccion={obtenerDireccion}
            barrioSeleccionado={barrioSeleccionado}
            setBarrioSeleccionado={setBarrioSeleccionado}
            mostrarBarrios={mostrarBarrios}
            setMostrarBarrios={setMostrarBarrios}
            editarIntervencion={manejarEditarIntervencion}
            intervencionEnfocada={intervencionEnfocada}
            modoDibujo={modoDibujo}
            setModoDibujo={setModoDibujo}
            sidebarAbierto={sidebarAbierto}
            enfocarIntervencion={manejarEnfocarIntervencion}
            assetsPanelAbierto={assetsPanelAbierto}
          />

          <AssetsPanel
            intervencionesFiltradas={intervencionesFiltradas}
            editarIntervencion={manejarEditarIntervencion}
            eliminarIntervencion={eliminarIntervencionProtegida}
            enfocarIntervencion={manejarEnfocarIntervencion}
            abierto={assetsPanelAbierto}
            setAbierto={setAssetsPanelAbierto}
          />
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
  )
}

export default App
