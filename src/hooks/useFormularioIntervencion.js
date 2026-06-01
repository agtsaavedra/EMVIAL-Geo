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

  setSugerencias,
  setBuscandoDireccion,

  mostrarToast,
}) {
  // =====================================================
  // ESTADO INTERNO
  // =====================================================

  const [form, setForm] =
    useState(formInicial)

  // Copia del formulario original cuando se edita.
  // Se usa para detectar cambios sin guardar.
  const [
    formOriginal,
    setFormOriginal,
  ] = useState(null)

  // =====================================================
  // RESET AL CAMBIAR PERÍODO
  // =====================================================
  // Cuando cambia el período:
  // - limpiamos formulario
  // - reseteamos mapa
  // - limpiamos filtros
  // - cancelamos edición activa

  useEffect(() => {
    setForm(formInicial)
    setFormOriginal(null)

    setPuntoSeleccionado(null)

    setBarrioSeleccionado('')

    setFiltroObra('')
    setFiltroEstado('')

    setSugerencias([])
    setBuscandoDireccion(false)

    setIntervencionEditandoId(null)
  }, [
    periodoActivo,
    setPuntoSeleccionado,
    setBarrioSeleccionado,
    setFiltroObra,
    setFiltroEstado,
    setSugerencias,
    setBuscandoDireccion,
    setIntervencionEditandoId,
  ])

  // =====================================================
  // CAMBIO DE CAMPOS
  // =====================================================

  function manejarCambio(e) {
    const { name, value } =
      e.target

    // ===============================
    // DIRECCIÓN
    // ===============================
    // Si cambia dirección:
    // - limpiamos coordenadas
    // - limpiamos punto temporal
    // - limpiamos sugerencias previas

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

    // ===============================
    // GEOMETRÍA
    // ===============================
    // Al cambiar Punto/Línea/Polígono:
    // - limpiamos geometría previa
    // - limpiamos coordenadas

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

    // ===============================
    // RESTO DE CAMPOS
    // ===============================

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // =====================================================
  // VALIDACIÓN GEOMÉTRICA
  // =====================================================

  function validarGeometria() {
    const cantidadPuntos =
      form.geometria?.length || 0

    if (
      form.geometriaTipo === 'Punto' &&
      (!form.latitud ||
        !form.longitud)
    ) {
      mostrarToast(
        'Primero seleccioná una ubicación en el mapa o buscá una dirección.',
        'error'
      )

      return false
    }

    if (
      form.geometriaTipo === 'Línea' &&
      cantidadPuntos < 2
    ) {
      mostrarToast(
        'Para una línea necesitás marcar al menos 2 puntos en el mapa.',
        'error'
      )

      return false
    }

    if (
      form.geometriaTipo ===
        'Polígono' &&
      cantidadPuntos < 3
    ) {
      mostrarToast(
        'Para un polígono necesitás marcar al menos 3 puntos en el mapa.',
        'error'
      )

      return false
    }

    return true
  }

  // =====================================================
  // GUARDAR / ACTUALIZAR
  // =====================================================

  async function guardarIntervencion(e) {
    e.preventDefault()

    const geometriaValida =
      validarGeometria()

    if (!geometriaValida) return

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

  // =====================================================
  // EDITAR INTERVENCIÓN
  // =====================================================

  function editarIntervencion(
    intervencion
  ) {
    setIntervencionEditandoId(
      intervencion.id
    )

    const formEditado = {
      ...formInicial,

      id: intervencion.id,

      nombre:
        intervencion.nombre || '',

      mesTerminacion:
        intervencion.mesTerminacion ||
        '',

      obra:
        intervencion.obra ||
        'MICROBACHEO',

      ubicacion:
        intervencion.ubicacion ||
        '',

      barrio:
        intervencion.barrio || '',

      estado:
        intervencion.estado ||
        'Pendiente',

      fuente:
        intervencion.fuente ||
        'Carga manual',

      inspector:
        intervencion.inspector ||
        '',

      realizo:
        intervencion.realizo ||
        '',

      cuadras:
        intervencion.cuadras || '',

      metrosLineales:
        intervencion.metrosLineales ||
        '',

      metrosCuadrados:
        intervencion.metrosCuadrados ||
        '',

      descripcion:
        intervencion.descripcion ||
        '',

      direccion:
        intervencion.direccion ||
        '',

      latitud:
        intervencion.latitud || '',

      longitud:
        intervencion.longitud ||
        '',

      geometriaTipo:
        intervencion.geometriaTipo ||
        'Punto',

      geometria:
        intervencion.geometria || [],
    }

    setForm(formEditado)
    setFormOriginal(formEditado)

    if (
      intervencion.latitud &&
      intervencion.longitud
    ) {
      setPuntoSeleccionado([
        parseFloat(
          intervencion.latitud
        ),
        parseFloat(
          intervencion.longitud
        ),
      ])
    } else {
      setPuntoSeleccionado(null)
    }
  }

  // =====================================================
  // CANCELAR EDICIÓN
  // =====================================================

  function cancelarEdicion() {
    setIntervencionEditandoId(
      null
    )

    setForm(formInicial)
    setFormOriginal(null)

    setPuntoSeleccionado(null)

    setBarrioSeleccionado('')

    setSugerencias([])

    setBuscandoDireccion(false)

    mostrarToast(
      'Edición cancelada.',
      'info'
    )
  }

  // =====================================================
  // DIRTY STATE
  // =====================================================
  // Detecta si hubo cambios desde
  // que se abrió la intervención.

  const hayCambiosSinGuardar =
    form.id && formOriginal
      ? JSON.stringify(form) !==
        JSON.stringify(formOriginal)
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
