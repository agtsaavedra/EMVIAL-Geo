import { useEffect, useState } from 'react'
import './App.css'

import Sidebar from './components/Sidebar.jsx'
import MapView from './components/MapView'
import AssetsPanel from './components/AssetsPanel'
import Topbar from './components/Topbar'
import { useIntervenciones } from './hooks/useIntervenciones'
import { exportarKml } from './utils/exportKML.js'


function App() {
  const {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    eliminarIntervencion,
    recargarIntervenciones,
  } = useIntervenciones()


  const [modoOscuro, setModoOscuro] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [buscandoDireccion, setBuscandoDireccion] = useState(false)
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)
  const [barrioSeleccionado, setBarrioSeleccionado] = useState('')
  const [mostrarBarrios, setMostrarBarrios] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [filtroObra, setFiltroObra] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBarrio, setFiltroBarrio] = useState('')
  const [periodoActivo, setPeriodoActivo] = useState(() => {
    return new Date().toISOString().slice(0, 7)
  })

  const formInicial = {
    nombre: '',
    mesTerminacion: '',
    obra: 'MICROBACHEO',
    ubicacion: '',
    barrio: '',
    estado: 'Pendiente',
    fuente: 'Carga manual',
    inspector: '',
    realizo: '',
    cuadras: '',
    metrosLineales: '',
    metrosCuadrados: '',
    descripcion: '',
    direccion: '',
    latitud: '',
    longitud: '',
    geometriaTipo: 'Punto',
    geometria: [],
  }

  const [form, setForm] = useState(formInicial)

  useEffect(() => {
    setForm(formInicial)
    setPuntoSeleccionado(null)
    setBarrioSeleccionado('')
    setFiltroObra('')
    setFiltroEstado('')
    setFiltroBarrio('')
    setSugerencias([])
    setBuscandoDireccion(false)
    setIntervencionEditandoId(null)
  }, [periodoActivo])




  const intervencionesDelPeriodo = intervenciones.filter((intervencion) => {
    return intervencion.periodo === periodoActivo
  })

  const barriosDisponibles = [
    ...new Set(
      intervencionesDelPeriodo
        .map((intervencion) => intervencion.barrio)
        .filter(Boolean)
    ),
  ].sort()

  const intervencionesFiltradas = intervencionesDelPeriodo.filter((intervencion) => {
    const texto = `
    ${intervencion.nombre}
    ${intervencion.obra}
    ${intervencion.ubicacion}
    ${intervencion.barrio}
    ${intervencion.estado}
    ${intervencion.fuente}
    ${intervencion.inspector}
    ${intervencion.realizo}
    ${intervencion.descripcion}
  `.toLowerCase()

    const coincideBusqueda = texto.includes(busqueda.toLowerCase())

    const coincideObra =
      !filtroObra || intervencion.obra === filtroObra

    const coincideEstado =
      !filtroEstado || intervencion.estado === filtroEstado

    const coincideBarrio =
      !filtroBarrio || intervencion.barrio === filtroBarrio

    return (
      coincideBusqueda &&
      coincideObra &&
      coincideEstado &&
      coincideBarrio
    )
  })

  async function obtenerDireccion(lat, lon) {
    return await window.api.obtenerDireccion(lat, lon)
  }

  async function obtenerCoordenadas(direccion) {
    const datos = await window.api.buscarDireccion(direccion)

    if (!datos.length) return null

    return {
      latitud: parseFloat(datos[0].lat),
      longitud: parseFloat(datos[0].lon),
      direccion: datos[0].display_name,
    }
  }

  function manejarCambio(e) {
    const { name, value } = e.target

    if (name === 'direccion') {
      setForm((prev) => ({
        ...prev,
        direccion: value,
        latitud: '',
        longitud: '',
      }))

      setPuntoSeleccionado(null)
      setSugerencias([])
      setBuscandoDireccion(false)
      return
    }

    if (name === 'geometriaTipo') {
      setForm((prev) => ({
        ...prev,
        geometriaTipo: value,
        geometria: [],
        latitud: '',
        longitud: '',
      }))

      setPuntoSeleccionado(null)
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function seleccionarSugerencia(sugerencia) {
    const lat = parseFloat(sugerencia.lat)
    const lon = parseFloat(sugerencia.lon)

    setForm((prev) => ({
      ...prev,
      direccion: sugerencia.display_name,
      latitud: lat.toFixed(6),
      longitud: lon.toFixed(6),
      geometria: [[lat, lon]],
    }))

    setPuntoSeleccionado([lat, lon])
    setSugerencias([])
  }

  async function buscarDireccion() {
    if (!form.direccion.trim()) return

    const resultado = await obtenerCoordenadas(form.direccion)

    if (!resultado) {
      alert('No se encontró la dirección.')
      return
    }

    setPuntoSeleccionado([resultado.latitud, resultado.longitud])

    setForm((prev) => ({
      ...prev,
      direccion: resultado.direccion,
      latitud: resultado.latitud.toFixed(6),
      longitud: resultado.longitud.toFixed(6),
      geometria:
        prev.geometriaTipo === 'Punto'
          ? [[resultado.latitud, resultado.longitud]]
          : prev.geometria,
    }))
  }

  async function guardarIntervencion(e) {
    e.preventDefault()

    if (form.geometriaTipo === 'Punto' && (!form.latitud || !form.longitud)) {
      alert('Primero seleccioná una ubicación en el mapa o buscá una dirección.')
      return
    }

    if (form.geometriaTipo === 'Línea' && form.geometria.length < 2) {
      alert('Para una línea necesitás marcar al menos 2 puntos en el mapa.')
      return
    }

    if (form.geometriaTipo === 'Polígono' && form.geometria.length < 3) {
      alert('Para un polígono necesitás marcar al menos 3 puntos en el mapa.')
      return
    }
    await guardarIntervencionEnDB({
      ...form,
      periodo: periodoActivo,
    })

    setPuntoSeleccionado(null)

    setForm(formInicial)
    setBarrioSeleccionado('')
    setSugerencias([])
  }

  async function crearBackup() {
    const resultado = await window.api.crearBackupManual(periodoActivo)

    if (resultado.ok) {
      alert('Backup creado correctamente.')
    }
  }

  async function restaurarBackup() {
    const confirmar = confirm(
      'Esto reemplazará la base actual por el backup seleccionado. ¿Continuar?'
    )

    if (!confirmar) return

    const resultado = await window.api.restaurarBackupManual()

    if (!resultado.ok) return

    await recargarIntervenciones()

    alert('Backup restaurado correctamente.')
  }

  function editarIntervencion(intervencion) {
    setIntervencionEditandoId(intervencion.id)

    setForm({
      nombre: intervencion.nombre || '',
      mesTerminacion: intervencion.mesTerminacion || '',
      obra: intervencion.obra || 'MICROBACHEO',
      ubicacion: intervencion.ubicacion || '',
      barrio: intervencion.barrio || '',
      estado: intervencion.estado || 'Pendiente',
      fuente: intervencion.fuente || 'Carga manual',
      inspector: intervencion.inspector || '',
      realizo: intervencion.realizo || '',
      cuadras: intervencion.cuadras || '',
      metrosLineales: intervencion.metrosLineales || '',
      metrosCuadrados: intervencion.metrosCuadrados || '',
      descripcion: intervencion.descripcion || '',
      direccion: intervencion.direccion || '',
      latitud: intervencion.latitud || '',
      longitud: intervencion.longitud || '',
      geometriaTipo: intervencion.geometriaTipo || 'Punto',
      geometria: intervencion.geometria || [],
    })

    if (intervencion.latitud && intervencion.longitud) {
      setPuntoSeleccionado([
        parseFloat(intervencion.latitud),
        parseFloat(intervencion.longitud),
      ])
    }
  }


  async function restaurarPeriodoActual() {
    const resultado = await window.api.restaurarPeriodoManual(periodoActivo)

    if (!resultado.ok) return

    await recargarIntervenciones()

    alert('Periodo restaurado correctamente.')
  }


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
          modoOscuro={modoOscuro}
          setModoOscuro={setModoOscuro}
          setBusqueda={setBusqueda}
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
          abrirCarpetaBackups={() => {
            window.api.abrirCarpetaBackups()
            setMenuAbierto(false)
          }}
          restaurarPeriodoActual={() => {
            restaurarPeriodoActual()
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