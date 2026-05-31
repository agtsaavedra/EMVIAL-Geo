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
  mostrarToast,
}) {
  // ===============================
  // Estado del formulario
  // ===============================

  const [form, setForm] = useState(formInicial)
  const [formOriginal, setFormOriginal] = useState(null)

  // ===============================
  // Reset al cambiar de período
  // ===============================

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
  }, [
    periodoActivo,
    setPuntoSeleccionado,
    setBarrioSeleccionado,
    setFiltroObra,
    setFiltroEstado,
    setFiltroBarrio,
    setSugerencias,
    setBuscandoDireccion,
    setIntervencionEditandoId,
  ])

  // ===============================
  // Cambios de campos
  // ===============================

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

  // ===============================
  // Guardar / actualizar intervención
  // ===============================

  async function guardarIntervencion(e) {



    e.preventDefault()

    if (
      form.geometriaTipo === 'Punto' &&
      (!form.latitud || !form.longitud)
    ) {
      mostrarToast(
        'Primero seleccioná una ubicación en el mapa o buscá una dirección.',
        'error'
      )
      return
    }

    if (
      form.geometriaTipo === 'Línea' &&
      form.geometria.length < 2
    ) {
      mostrarToast(
        'Para una línea necesitás marcar al menos 2 puntos en el mapa.',
        'error'
      )
      return
    }

    if (
      form.geometriaTipo === 'Polígono' &&
      form.geometria.length < 3
    ) {
      mostrarToast(
        'Para un polígono necesitás marcar al menos 3 puntos en el mapa.',
        'error'
      )
      return
    }

    await guardarIntervencionEnDB({
      ...form,
      periodo: periodoActivo,
    })

    mostrarToast(
      form.id
        ? 'Intervención actualizada correctamente.'
        : 'Intervención guardada correctamente.',
      'success'
    )

    setPuntoSeleccionado(null)
    setForm(formInicial)
    setFormOriginal(null)
    setBarrioSeleccionado('')
    setSugerencias([])
    setIntervencionEditandoId(null)
  }

  // ===============================
  // Cargar intervención en formulario
  // ===============================

  function editarIntervencion(intervencion) {
    setIntervencionEditandoId(intervencion.id)


    const formEditado = {
      ...formInicial,
      id: intervencion.id,
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
    }


    setForm(formEditado)
    setFormOriginal(formEditado)

    if (intervencion.latitud && intervencion.longitud) {
      setPuntoSeleccionado([
        parseFloat(intervencion.latitud),
        parseFloat(intervencion.longitud),
      ])
    } else {
      setPuntoSeleccionado(null)
    }
  }


  // ===============================
  // Cancelar edición actual
  // ===============================

 function cancelarEdicion() {
  // salir del modo edición
  setIntervencionEditandoId(null)

  // limpiar formulario
  setForm(formInicial)

  // limpiar original
  setFormOriginal(null)

  // limpiar selección temporal del mapa
  setPuntoSeleccionado(null)

  // limpiar barrio temporal
  setBarrioSeleccionado('')

  // limpiar sugerencias
  setSugerencias([])

  // frenar búsqueda
  setBuscandoDireccion(false)

  mostrarToast(
    'Edición cancelada.',
    'info'
  )
}


const hayCambiosSinGuardar =
      form.id && formOriginal
        ? JSON.stringify(form) !== JSON.stringify(formOriginal)
        : false



  return {
    form,
    setForm,
    manejarCambio,
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
    hayCambiosSinGuardar,
  }
}