/**
 * Hook controlador del formulario de intervención.
 *
 * Administra estado del formulario, validación geométrica, edición, cancelación
 * y detección de cambios sin guardar. También sincroniza estados externos del
 * mapa y filtros.
 */

import { useEffect, useState } from 'react'

import { formInicial } from '@constants/formInicial'

import {
  calcularAreaPoligonoMetrosCuadrados,
  calcularLongitudLineaMetros,
  formatearMetrosCuadradosFormulario,
  formatearMetrosFormulario,
} from '@services/geometryMetrics'

// Punto de entrada público del hook.
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
  // AUTOCÁLCULO DE METROS LINEALES
  // =====================================================
  // Cuando la intervención es una línea, el campo "Metros lineales" se completa
  // automáticamente a partir de la geometría dibujada.
  //
  // El campo sigue siendo editable: si el usuario lo corrige manualmente, no se
  // pisa hasta que vuelva a cambiar la geometría.

  useEffect(() => {
    if (form.geometriaTipo !== 'Línea') {
      return
    }

    const longitudMetros =
      calcularLongitudLineaMetros(
        form.geometria
      )

    const metrosFormateados =
      formatearMetrosFormulario(
        longitudMetros
      )

    setForm((prev) => {
      if (
        prev.metrosLineales ===
        metrosFormateados
      ) {
        return prev
      }

      return {
        ...prev,
        metrosLineales:
          metrosFormateados,
      }
    })
  }, [
    form.geometria,
    form.geometriaTipo,
  ])

  // =====================================================
  // AUTOCÁLCULO DE METROS CUADRADOS
  // =====================================================
  // Cuando la intervención es un polígono, el campo "Metros cuadrados" se
  // completa automáticamente a partir del área dibujada.
  //
  // Igual que con metros lineales, el campo sigue siendo editable para permitir
  // redondeos o correcciones operativas.

  useEffect(() => {
    if (
      form.geometriaTipo !==
      'Polígono'
    ) {
      return
    }

    const areaMetrosCuadrados =
      calcularAreaPoligonoMetrosCuadrados(
        form.geometria
      )

    const areaFormateada =
      formatearMetrosCuadradosFormulario(
        areaMetrosCuadrados
      )

    setForm((prev) => {
      if (
        prev.metrosCuadrados ===
        areaFormateada
      ) {
        return prev
      }

      return {
        ...prev,
        metrosCuadrados:
          areaFormateada,
      }
    })
  }, [
    form.geometria,
    form.geometriaTipo,
  ])

  // =====================================================
  // CAMBIO DE CAMPOS
  // =====================================================

  // Actualiza el formulario y resetea dependencias cuando cambia un campo sensible.
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
    // - limpiamos métricas que ya no aplican

    if (name === 'geometriaTipo') {
      setForm((prev) => ({
        ...prev,
        geometriaTipo: value,
        geometria: [],
        latitud: '',
        longitud: '',
        metrosLineales:
          value === 'Línea'
            ? prev.metrosLineales
            : '',
        metrosCuadrados:
          value === 'Polígono'
            ? prev.metrosCuadrados
            : '',
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

  // Comprueba que la geometría cargada alcance para el tipo seleccionado.
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

  // Valida y guarda la intervención actual del formulario.
  async function guardarIntervencion(e) {
    e.preventDefault()

    const geometriaValida =
      validarGeometria()

    if (!geometriaValida) return

    await guardarIntervencionEnDB({
      ...form,
      periodo: periodoActivo,
      estado: 'Finalizada',
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

  // Carga una intervención existente en el formulario para editarla.
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
        'Finalizada',

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

  // Sale del modo edición y limpia estado asociado.
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
  // Detecta si hubo cambios desde que se abrió la intervención.
  //
  // En edición compara contra la copia original.
  // En intervención nueva revisa si el usuario ya cargó datos o geometría.

  const hayGeometria =
    Array.isArray(form.geometria) &&
    form.geometria.length > 0

  const hayCambiosSinGuardar =
    form.id && formOriginal
      ? JSON.stringify(form) !==
        JSON.stringify(formOriginal)
      : Boolean(
          form.nombre ||
            form.ubicacion ||
            form.descripcion ||
            form.latitud ||
            form.longitud ||
            hayGeometria
        )

  // API pública que consume el resto de la aplicación.
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
