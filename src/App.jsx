import './App.css'
import { useState } from 'react'
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

import { exportarExcelPeriodo } from './services/exportExcel.js'
import { exportarKml } from './utils/exportKML.js'

function App() {
  // ===============================
  // Hooks globales de UI
  // ===============================

  const { toast, mostrarToast } = useToast()
  const { dialogo, confirmar, cerrarDialogo } = useConfirmDialog()

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
    intervencionEnfocada,
    setIntervencionEnfocada,
    modoDibujo,
    setModoDibujo,
    sidebarAbierto,
    setSidebarAbierto,
  } = useUIState()

  // ===============================
  // Periodo activo
  // ===============================

  const { periodoActivo, setPeriodoActivo } = usePeriodo()

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
    cancelarEdicion,
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
    mostrarToast,
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
    mostrarToast,
  })

  // ===============================
  // Filtros
  // ===============================

  const {
    intervencionesDelPeriodo,
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
  // Acciones auxiliares
  // ===============================

  function manejarEditarIntervencion(intervencion) {
    setSidebarAbierto(true)
    editarIntervencion(intervencion)
  }

  // ===============================
  // Render
  // ===============================


  const [aboutAbierto, setAboutAbierto] =
    useState(false)

  const [estadoApp, setEstadoApp] =
    useState(null)

  async function abrirAbout() {
    const estado =
      await window.api.obtenerEstadoApp()

    setEstadoApp(estado)
    setAboutAbierto(true)
  }
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
        cancelarEdicion={cancelarEdicion}
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
          abrirAbout={() => {
            setMenuAbierto(false)
            abrirAbout()
          }}
          exportarKmlActual={() => {
            setMenuAbierto(false)

            const ok = exportarKml(intervencionesDelPeriodo)

            mostrarToast(
              ok
                ? 'KML exportado correctamente.'
                : 'No hay intervenciones para exportar en este período.',
              ok ? 'success' : 'error'
            )
          }}

          exportarExcelActual={() => {
            setMenuAbierto(false)

            const ok = exportarExcelPeriodo(
              intervencionesDelPeriodo,
              periodoActivo
            )

            mostrarToast(
              ok
                ? 'Excel exportado correctamente.'
                : 'No hay intervenciones para exportar en este período.',
              ok ? 'success' : 'error'
            )
          }}

          crearBackup={async () => {
            setMenuAbierto(false)

            const resultado = await crearBackup()

            mostrarToast(
              resultado?.message || 'Backup creado correctamente.',
              resultado?.ok === false ? 'error' : 'success'
            )
          }}

          restaurarBackup={() => {
            setMenuAbierto(false)

            confirmar({
              titulo: 'Restaurar backup',
              mensaje:
                'Se reemplazará la base actual por el backup seleccionado.',
              detalle:
                'Esta acción sobrescribirá la información actual.',
              textoConfirmar: 'Restaurar',
              textoCancelar: 'Cancelar',
              danger: true,
              onConfirmar: async () => {
                const resultado = await restaurarBackup()

                mostrarToast(
                  resultado?.message || 'Backup restaurado correctamente.',
                  resultado?.ok === false ? 'error' : 'success'
                )
              },
            })
          }}

          restaurarPeriodoActual={() => {
            setMenuAbierto(false)

            confirmar({
              titulo: 'Restaurar período',
              mensaje: `Se restaurarán únicamente las intervenciones del período ${periodoActivo}.`,
              detalle: 'Los demás períodos no se modificarán.',
              textoConfirmar: 'Restaurar período',
              textoCancelar: 'Cancelar',
              danger: true,
              onConfirmar: async () => {
                const resultado = await restaurarPeriodoActual()

                mostrarToast(
                  resultado?.message || 'Período restaurado correctamente.',
                  resultado?.ok === false ? 'error' : 'success'
                )
              },
            })
          }}

          abrirCarpetaBackups={() => {
            setMenuAbierto(false)
            window.api.abrirCarpetaBackups()
          }}

          configurarCarpetaBackups={async () => {
            setMenuAbierto(false)

            const resultado =
              await window.api.configurarCarpetaBackups()

            mostrarToast(
              resultado?.message || 'Carpeta de backups configurada.',
              resultado?.ok ? 'success' : 'error'
            )
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
            editarIntervencion={manejarEditarIntervencion}
            intervencionEnfocada={intervencionEnfocada}
            modoDibujo={modoDibujo}
            setModoDibujo={setModoDibujo}
            sidebarAbierto={sidebarAbierto}
          />

          <AssetsPanel
            intervencionesFiltradas={intervencionesFiltradas}
            editarIntervencion={manejarEditarIntervencion}
            eliminarIntervencion={(intervencion) => {
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
            }}
            enfocarIntervencion={setIntervencionEnfocada}
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
        onCerrar={() =>
          setAboutAbierto(false)
        }
        estadoApp={estadoApp}
        periodoActivo={periodoActivo}
      />
    </div>
  )
}

export default App