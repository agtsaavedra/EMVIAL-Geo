import { useEffect, useState } from 'react'
import './App.css'

import Sidebar from './components/Sidebar.jsx'
import MapView from './components/MapView'
import AssetsPanel from './components/AssetsPanel'

function App() {
  const [intervenciones, setIntervenciones] = useState(() => {
    const guardadas = localStorage.getItem('emvial_intervenciones')
    return guardadas ? JSON.parse(guardadas) : []
  })

  const [intervencionEditandoId, setIntervencionEditandoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [buscandoDireccion, setBuscandoDireccion] = useState(false)
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)
  const [barrioSeleccionado, setBarrioSeleccionado] = useState('')

  const [form, setForm] = useState({
    area: 'Vialidad',
    fecha: '',
    barrio: '',
    tipoIntervencion: 'Mantenimiento',
    subtipo: '',
    estado: 'Pendiente',
    fuente: 'Carga manual',
    direccion: '',
    latitud: '',
    longitud: '',
    descripcion: '',
    unidad: 'cuadras',
    cantidad: '',
    geometriaTipo: 'Punto',
  })

  useEffect(() => {
    localStorage.setItem(
      'emvial_intervenciones',
      JSON.stringify(intervenciones)
    )
  }, [intervenciones])

  const intervencionesFiltradas = intervenciones.filter((intervencion) => {
    const texto = `
      ${intervencion.area}
      ${intervencion.barrio}
      ${intervencion.tipoIntervencion}
      ${intervencion.subtipo}
      ${intervencion.estado}
      ${intervencion.fuente}
      ${intervencion.direccion}
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

  async function buscarSugerenciasDireccion(valor) {
    if (valor.trim().length < 3) {
      setSugerencias([])
      setBuscandoDireccion(false)
      return
    }

    setBuscandoDireccion(true)

    try {
      const datos = await window.api.buscarDireccion(valor)
      setSugerencias(datos || [])
    } catch (error) {
      console.error('Error buscando sugerencias:', error)
      setSugerencias([])
    } finally {
      setBuscandoDireccion(false)
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
    }))
  }

  function guardarIntervencion(e) {
    e.preventDefault()

    if (!form.latitud || !form.longitud) {
      alert(
        'Primero seleccioná una ubicación en el mapa o buscá una dirección.'
      )
      return
    }

    if (intervencionEditandoId) {
      setIntervenciones(
        intervenciones.map((intervencion) =>
          intervencion.id === intervencionEditandoId
            ? { ...intervencion, ...form }
            : intervencion
        )
      )

      setIntervencionEditandoId(null)
    } else {
      const nuevaIntervencion = {
        id: Date.now(),
        ...form,
      }

      setIntervenciones([...intervenciones, nuevaIntervencion])
    }

    setForm({
      area: 'Vialidad',
      fecha: '',
      barrio: '',
      tipoIntervencion: 'Mantenimiento',
      subtipo: '',
      estado: 'Pendiente',
      fuente: 'Carga manual',
      direccion: '',
      latitud: '',
      longitud: '',
      descripcion: '',
      unidad: 'cuadras',
      cantidad: '',
      geometriaTipo: 'Punto',
    })

    setPuntoSeleccionado(null)
  }

  function eliminarIntervencion(id) {
    const confirmar = confirm(
      '¿Seguro que querés eliminar esta intervención?'
    )

    if (!confirmar) return

    setIntervenciones(
      intervenciones.filter((intervencion) => intervencion.id !== id)
    )
  }

  function editarIntervencion(intervencion) {
    setIntervencionEditandoId(intervencion.id)

    setForm({
      area: intervencion.area || 'Vialidad',
      fecha: intervencion.fecha || '',
      barrio: intervencion.barrio || '',
      tipoIntervencion:
        intervencion.tipoIntervencion || 'Mantenimiento',
      subtipo: intervencion.subtipo || '',
      estado: intervencion.estado || 'Pendiente',
      fuente: intervencion.fuente || 'Carga manual',
      direccion: intervencion.direccion || '',
      latitud: intervencion.latitud || '',
      longitud: intervencion.longitud || '',
      descripcion: intervencion.descripcion || '',
      unidad: intervencion.unidad || 'cuadras',
      cantidad: intervencion.cantidad || '',
      geometriaTipo: intervencion.geometriaTipo || 'Punto',
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

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por área, barrio, tipo, estado o dirección..."
          />
        </header>

        <section className="content">
          <MapView
            intervencionesFiltradas={intervencionesFiltradas}
            puntoSeleccionado={puntoSeleccionado}
            setPuntoSeleccionado={setPuntoSeleccionado}
            setForm={setForm}
            obtenerDireccion={obtenerDireccion}
            barrioSeleccionado={barrioSeleccionado}
            setBarrioSeleccionado={setBarrioSeleccionado}
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