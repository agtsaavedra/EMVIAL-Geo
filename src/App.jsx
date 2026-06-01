import './App.css'
import { useState, useEffect } from 'react'
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
    assetsPanelAbierto,
    setAssetsPanelAbierto,
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
    hayCambiosSinGuardar,
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
    modoDibujo,
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
  function manejarEnfocarIntervencion(intervencion) {
    setIntervencionEnfocada({
      ...intervencion,
      __focusKey: Date.now(),
    })
  }

  function manejarEditarIntervencion(intervencion) {
    manejarEnfocarIntervencion(intervencion)

    setSidebarAbierto(true)

    if (window.innerWidth <= 1024) {
      setAssetsPanelAbierto(false)

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
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
      textoConfirmar: 'Descartar cambios',
      textoCancelar: 'Seguir editando',
      danger: true,
      onConfirmar: cancelarEdicion,
    })
  }


  function manejarCambioPeriodo(nuevoPeriodo) {
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
      textoConfirmar: 'Cambiar período',
      textoCancelar: 'Seguir editando',
      danger: true,
      onConfirmar: () => {
        cancelarEdicion()
        setPeriodoActivo(nuevoPeriodo)
      },
    })
  }

  useEffect(() => {
    function manejarSolicitudCierre() {
      if (!hayCambiosSinGuardar) {
        window.api.confirmarCierreApp()
        return
      }

      confirmar({
        titulo: 'Salir sin guardar',
        mensaje:
          'Hay cambios sin guardar en la intervención actual.',
        detalle:
          'Si salís ahora, se perderán las modificaciones realizadas.',
        textoConfirmar: 'Salir igual',
        textoCancelar: 'Seguir editando',
        danger: true,
        onConfirmar: () => {
          window.api.confirmarCierreApp()
        },
      })
    }

    const cleanup =
      window.api.onAppCloseRequest(
        manejarSolicitudCierre
      )

    return () => {
      cleanup?.()
    }
  }, [
    hayCambiosSinGuardar,
    confirmar,
  ])

  useEffect(() => {
  function manejarAtajos(event) {
    const tag =
      document.activeElement?.tagName?.toLowerCase()

    const escribiendo =
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select'

    // ==========================
    // Ctrl + S → guardar
    // ==========================
    if (
      event.ctrlKey &&
      event.key.toLowerCase() === 's'
    ) {
      event.preventDefault()

      const formElement =
        document.querySelector('form')

      formElement?.requestSubmit?.()

      return
    }

    // ==========================
    // Ctrl + F → búsqueda
    // ==========================
    if (
      event.ctrlKey &&
      event.key.toLowerCase() === 'f'
    ) {
      event.preventDefault()

      const buscador =
        document.querySelector(
          '.topbar-actions input'
        )

      buscador?.focus?.()
      buscador?.select?.()

      return
    }

    // ==========================
// Ctrl + M → modo dibujo
// ==========================
if (
  event.ctrlKey &&
  event.key.toLowerCase() === 'd'
) {
  event.preventDefault()

  setModoDibujo((prev) => {
    const nuevoEstado = !prev

    mostrarToast(
      nuevoEstado
        ? 'Modo dibujo activado.'
        : 'Modo dibujo desactivado.',
      'info'
    )

    return nuevoEstado
  })

  return
}


    // ==========================
    // Esc → salir modo dibujo
    // ==========================
    if (
      event.key === 'Escape' &&
      modoDibujo &&
      !escribiendo
    ) {
      setModoDibujo(false)

      mostrarToast(
        'Modo dibujo desactivado.',
        'info'
      )
    }
  }

  window.addEventListener(
    'keydown',
    manejarAtajos
  )

  return () => {
    window.removeEventListener(
      'keydown',
      manejarAtajos
    )


    
  }


  
}, [
  modoDibujo,
  setModoDibujo,
  mostrarToast,
])
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
            enfocarIntervencion={manejarEnfocarIntervencion}
            assetsPanelAbierto={
              assetsPanelAbierto
            }
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