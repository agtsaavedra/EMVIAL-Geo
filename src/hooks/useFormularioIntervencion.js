import { useEffect, useState } from 'react'
import { formInicial } from '../constants/formInicial'

export function useFormularioIntervencion({
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
}) {
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

  return {
    form,
    setForm,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
  }
}