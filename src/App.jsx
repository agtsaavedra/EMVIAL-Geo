import { useEffect, useState } from 'react'
import './App.css'

import Sidebar from './components/Sidebar.jsx'
import MapView from './components/MapView'
import AssetsPanel from './components/AssetsPanel'
import { exportarKml } from './utils/exportKML.js'

function App() {
  const [intervenciones, setIntervenciones] = useState([])

  const [intervencionEditandoId, setIntervencionEditandoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [buscandoDireccion, setBuscandoDireccion] = useState(false)
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)
  const [barrioSeleccionado, setBarrioSeleccionado] = useState('')
  const [mostrarBarrios, setMostrarBarrios] = useState(true)
const [menuAbierto, setMenuAbierto] = useState(false)


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
    async function cargarIntervenciones() {
      const datos = await window.api.obtenerIntervenciones()
      setIntervenciones(datos)
    }

    cargarIntervenciones()
  }, [])

  const intervencionesFiltradas = intervenciones.filter((intervencion) => {
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
    return texto.includes(busqueda.toLowerCase())
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

    if (intervencionEditandoId) {
      const actualizada = await window.api.guardarIntervencion({
        id: intervencionEditandoId,
        ...form,
      })

      setIntervenciones((prev) =>
        prev.map((intervencion) =>
          intervencion.id === intervencionEditandoId
            ? actualizada
            : intervencion
        )
      )

      setIntervencionEditandoId(null)
    } else {
      const nueva = await window.api.guardarIntervencion({
        id: Date.now(),
        ...form,
      })

      setIntervenciones((prev) => [nueva, ...prev])
    }

    setForm(formInicial)
    setPuntoSeleccionado(null)
  }

  async function eliminarIntervencion(id) {
    const confirmar = confirm('¿Seguro que querés eliminar esta intervención?')

    if (!confirmar) return

    await window.api.eliminarIntervencion(id)

    setIntervenciones((prev) =>
      prev.filter((intervencion) => intervencion.id !== id)
    )
  }

  async function crearBackup() {
    const resultado = await window.api.crearBackupManual()

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

    const datos = await window.api.obtenerIntervenciones()

    setIntervenciones(datos)

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

  return (
    <div className="app">
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
        <header className="topbar">
          <div>
            <h2>Mapa de intervenciones</h2>
            <span>Mar del Plata / Partido de General Pueyrredon</span>
          </div>

         <div className="topbar-actions">
  <input
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    placeholder="Buscar por obra, barrio, estado o ubicación..."
  />

  <div className="menu-wrapper">
    <button
      type="button"
      className="menu-btn"
      onClick={() => setMenuAbierto((prev) => !prev)}
    >
      ☰
    </button>

    {menuAbierto && (
      <div className="dropdown-menu">
        <button
          type="button"
          onClick={() => {
            exportarKml(intervencionesFiltradas)
            setMenuAbierto(false)
          }}
        >
          Exportar KML
        </button>

        <button
          type="button"
          onClick={() => {
            crearBackup()
            setMenuAbierto(false)
          }}
        >
          Crear backup
        </button>

        <button
          type="button"
          className="danger"
          onClick={() => {
            restaurarBackup()
            setMenuAbierto(false)
          }}
        >
          Restaurar backup
        </button>
        <button
  type="button"
  onClick={() => {
    window.api.abrirCarpetaBackups()
    setMenuAbierto(false)
  }}
>
  Abrir carpeta de backups
</button>
      </div>
    )}
  </div>
</div>
        </header>

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