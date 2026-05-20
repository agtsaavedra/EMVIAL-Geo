import { useEffect, useState } from 'react'
import './App.css'

import Sidebar from './components/Sidebar.jsx'
import MapView from './components/MapView'
import AssetsPanel from './components/AssetsPanel'

function App() {
  const [activos, setActivos] = useState(() => {
    const guardados = localStorage.getItem('emvial_activos')
    return guardados ? JSON.parse(guardados) : []
  })

  const [barrioSeleccionado, setBarrioSeleccionado] = useState('')

  const [activoEditandoId, setActivoEditandoId] = useState(null)

  const [busqueda, setBusqueda] = useState('')

  const [sugerencias, setSugerencias] = useState([])
  const [buscandoDireccion, setBuscandoDireccion] = useState(false)

  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)

  const [form, setForm] = useState({
    tipo: 'Luminaria',
    direccion: '',
    latitud: '',
    longitud: '',
    estado: 'Pendiente',
    descripcion: '',
  })

  useEffect(() => {
    localStorage.setItem('emvial_activos', JSON.stringify(activos))
  }, [activos])

  const activosFiltrados = activos.filter((activo) => {
    const texto =
      `${activo.tipo} ${activo.direccion} ${activo.estado}`.toLowerCase()

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

      console.log('Sugerencias recibidas:', datos)

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

  function guardarActivo(e) {
    e.preventDefault()

    if (!form.latitud || !form.longitud) {
      alert(
        'Primero seleccioná una ubicación en el mapa o buscá una dirección.'
      )
      return
    }

    if (activoEditandoId) {
      setActivos(
        activos.map((activo) =>
          activo.id === activoEditandoId
            ? { ...activo, ...form }
            : activo
        )
      )

      setActivoEditandoId(null)
    } else {
      const nuevoActivo = {
        id: Date.now(),
        ...form,
      }

      setActivos([...activos, nuevoActivo])
    }

    setForm({
      tipo: 'Luminaria',
      direccion: '',
      latitud: '',
      longitud: '',
      estado: 'Pendiente',
      descripcion: '',
    })

    setPuntoSeleccionado(null)
  }

  function eliminarActivo(id) {
    const confirmar = confirm(
      '¿Seguro que querés eliminar este activo?'
    )

    if (!confirmar) return

    setActivos(activos.filter((activo) => activo.id !== id))
  }

  function editarActivo(activo) {
    setActivoEditandoId(activo.id)

    setForm({
      tipo: activo.tipo,
      direccion: activo.direccion,
      latitud: activo.latitud,
      longitud: activo.longitud,
      estado: activo.estado,
      descripcion: activo.descripcion || '',
    })

    setPuntoSeleccionado([
      parseFloat(activo.latitud),
      parseFloat(activo.longitud),
    ])
  }

  return (
    <div className="app">
      <Sidebar
        form={form}
        manejarCambio={manejarCambio}
        guardarActivo={guardarActivo}
        buscarDireccion={buscarDireccion}
        sugerencias={sugerencias}
        buscandoDireccion={buscandoDireccion}
        seleccionarSugerencia={seleccionarSugerencia}
        activoEditandoId={activoEditandoId}
      />

      <main className="main">
        <header className="topbar">
          <div>
            <h2>Mapa de activos</h2>
            <span>Mar del Plata</span>
          </div>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por dirección, tipo o estado..."
          />
        </header>

        <section className="content">
          <MapView
            activosFiltrados={activosFiltrados}
            puntoSeleccionado={puntoSeleccionado}
            setPuntoSeleccionado={setPuntoSeleccionado}
            setForm={setForm}
            obtenerDireccion={obtenerDireccion}
            barrioSeleccionado={barrioSeleccionado}
            setBarrioSeleccionado={setBarrioSeleccionado}
          />

          <AssetsPanel
            activosFiltrados={activosFiltrados}
            editarActivo={editarActivo}
            eliminarActivo={eliminarActivo}
          />
        </section>
      </main>
    </div>
  )
}

export default App