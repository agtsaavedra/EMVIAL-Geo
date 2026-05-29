import './App.css'

import Sidebar from './components/Sidebar.jsx'
import MapView from './components/map/MapView.jsx'
import AssetsPanel from './components/AssetsPanel'
import Topbar from './components/Topbar'

import { useIntervenciones } from './hooks/useIntervenciones'
import { useUIState } from './hooks/useUIState'
import { usePeriodo } from './hooks/usePeriodo'
import { useBackups } from './hooks/useBackups'
import { useFormularioIntervencion } from './hooks/useFormularioIntervencion'
import { useGeocoding } from './hooks/useGeocoding'
import { useFiltrosIntervenciones } from './hooks/useFiltrosIntervenciones'

import { exportarKml } from './utils/exportKML.js'

function App() {
  // ===============================
  // Datos persistentes
  // ===============================

  const {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    eliminarIntervencion,
    recargarIntervenciones,
  } = useIntervenciones()

  // ===============================
  // Estado visual general
  // ===============================

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
    filtroBarrio,
    setFiltroBarrio,
  } = useUIState()

  // ===============================
  // Periodo activo
  // ===============================

  const {
    periodoActivo,
    setPeriodoActivo,
  } = usePeriodo()

  // ===============================
  // Backups
  // ===============================

  const {
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  } = useBackups({
    periodoActivo,
    recargarIntervenciones,
  })

  // ===============================
  // Formulario
  // ===============================

  const {
    form,
    setForm,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
  } = useFormularioIntervencion({
    periodoActivo,
    guardarIntervencionEnDB,
    setIntervencionEditandoId,
    setPuntoSeleccionado,
    setBarrioSeleccionado,
    setFiltroObra,
    setFiltroEstado,
    setFiltroBarrio,
    setSugerencias,
    setBuscandoDireccion,
  })

  // ===============================
  // Geocoding
  // ===============================

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
  })

  // ===============================
  // Filtros
  // ===============================

  const {
    intervencionesFiltradas,
    barriosDisponibles,
  } = useFiltrosIntervenciones({
    intervenciones,
    periodoActivo,
    busqueda,
    filtroObra,
    filtroEstado,
    filtroBarrio,
  })

  // ===============================
  // Render
  // ===============================

  return (
    <div className={`app ${modoOscuro ? 'dark' : ''}`}>
      <Sidebar
        form={form}
        manejarCambio={manejarCambio}
        guardarIntervencion={guardarIntervencion}
        buscarDireccion={buscarDireccion}
        sugerencias={sugerencias}
        buscandoDireccion={buscandoDireccion}
        seleccionarSugerencia={seleccionarSugerencia}
        activoEditandoId={intervencionEditandoId}
      />

      <main className="main">
        <Topbar
          periodoActivo={periodoActivo}
          setPeriodoActivo={setPeriodoActivo}
          filtroObra={filtroObra}
          setFiltroObra={setFiltroObra}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          filtroBarrio={filtroBarrio}
          setFiltroBarrio={setFiltroBarrio}
          barriosDisponibles={barriosDisponibles}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          modoOscuro={modoOscuro}
          setModoOscuro={setModoOscuro}
          menuAbierto={menuAbierto}
          setMenuAbierto={setMenuAbierto}
          exportarKmlActual={() => {
            exportarKml(intervencionesFiltradas)
            setMenuAbierto(false)
          }}
          crearBackup={() => {
            crearBackup()
            setMenuAbierto(false)
          }}
          restaurarBackup={() => {
            restaurarBackup()
            setMenuAbierto(false)
          }}
          restaurarPeriodoActual={() => {
            restaurarPeriodoActual()
            setMenuAbierto(false)
          }}
          abrirCarpetaBackups={() => {
            window.api.abrirCarpetaBackups()
            setMenuAbierto(false)
          }}
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
            editarIntervencion={editarIntervencion}
          />

          <AssetsPanel
            intervencionesFiltradas={intervencionesFiltradas}
            editarIntervencion={editarIntervencion}
            eliminarIntervencion={eliminarIntervencion}
          />
        </section>
      </main>
    </div>
  )
}

export default App