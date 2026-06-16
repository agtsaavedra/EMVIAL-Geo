/**
 * Hook controlador del formulario de intervención.
 *
 * Administra estado del formulario, validación geométrica, edición, cancelación
 * y detección de cambios sin guardar. También sincroniza estados externos del
 * mapa y filtros.
 */

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { formInicial } from '@constants/formInicial'

import {
  calcularAreaPoligonoMetrosCuadrados,
  calcularLongitudLineaMetros,
  formatearMetrosCuadradosFormulario,
  formatearMetrosFormulario,
} from '@services/geometryMetrics'

// Punto de entrada público del hook.
function esGeometriaLinea(tipo) {
  const texto = String(tipo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return texto === 'linea' || texto.includes('nea')
}

function esGeometriaPoligono(tipo) {
  const texto = String(tipo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return texto === 'poligono'
}

function esGeometriaPunto(tipo) {
  return String(tipo || '').trim() === 'Punto'
}

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
  const [
    ubicacionAutomaticaLinea,
    setUbicacionAutomaticaLinea,
  ] = useState(false)
  const [
    ubicacionManualLinea,
    setUbicacionManualLinea,
  ] = useState(false)
  const [recalculoLineaTick, setRecalculoLineaTick] =
    useState(0)

  // Copia del formulario original cuando se edita.
  // Se usa para detectar cambios sin guardar.
  const [
    formOriginal,
    setFormOriginal,
  ] = useState(null)
  const ubicacionAutoLineaRef =
    useRef('')
  const ubicacionLineaManualRef =
    useRef(false)
  const calculoCuadrasVersionRef =
    useRef(0)
  const advertenciaLineaRef =
    useRef('')

  function invalidarUbicacionAutoLinea() {
    ubicacionAutoLineaRef.current = ''
    ubicacionLineaManualRef.current = false
    setUbicacionAutomaticaLinea(false)
    setUbicacionManualLinea(false)
    advertenciaLineaRef.current = ''
    calculoCuadrasVersionRef.current += 1
  }

  function recalcularUbicacionLinea() {
    ubicacionLineaManualRef.current = false
    ubicacionAutoLineaRef.current = ''
    setUbicacionAutomaticaLinea(false)
    setUbicacionManualLinea(false)
    setRecalculoLineaTick((actual) => actual + 1)
  }

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
    invalidarUbicacionAutoLinea()

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
    if (!esGeometriaLinea(form.geometriaTipo)) {
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
  // AUTOCÁLCULO DE CUADRAS
  // =====================================================
  // Usa la red vial cargada bajo demanda desde public/data. Si no detecta
  // tramos cercanos, el servicio vuelve a una estimación por metros / 100.

  useEffect(() => {
    let activo = true
    const versionCalculo =
      calculoCuadrasVersionRef.current + 1
    calculoCuadrasVersionRef.current =
      versionCalculo

    async function calcularCuadras() {
      if (
        !esGeometriaLinea(form.geometriaTipo) ||
        !Array.isArray(form.geometria) ||
        form.geometria.length < 2
      ) {
        setForm((prev) => {
          if (!prev.cuadras) return prev

          return {
            ...prev,
            cuadras: '',
          }
        })
        return
      }

      const { calcularCuadrasLineaAsync } =
        await import('@services/callesMetricsWorker')

      const resultado =
        await calcularCuadrasLineaAsync(
          form.geometria
        )

      if (
        !activo ||
        versionCalculo !==
          calculoCuadrasVersionRef.current
      ) {
        return
      }

      if (resultado.advertencia?.tipo) {
        const claveAdvertencia = [
          resultado.advertencia.tipo,
          ...(resultado.advertencia.calles || []),
        ].join(':')

        if (
          advertenciaLineaRef.current !==
          claveAdvertencia
        ) {
          advertenciaLineaRef.current =
            claveAdvertencia

          mostrarToast(
            resultado.advertencia.mensaje ||
              'La linea dibujada pertenece a mas de una calle. Cargue otra intervencion para el tramo adicional.',
            'error'
          )
        }
      } else {
        advertenciaLineaRef.current = ''
      }

      setForm((prev) => {
        const debeActualizarUbicacion =
          resultado.ubicacion &&
          !ubicacionLineaManualRef.current

        if (
          prev.cuadras ===
            resultado.cuadras &&
          !debeActualizarUbicacion
        ) {
          return prev
        }

        if (debeActualizarUbicacion) {
          ubicacionAutoLineaRef.current =
            resultado.ubicacion
          setUbicacionAutomaticaLinea(true)
          setUbicacionManualLinea(false)
        }

        return {
          ...prev,
          cuadras: resultado.cuadras,
          ubicacion: debeActualizarUbicacion
            ? resultado.ubicacion
            : prev.ubicacion,
        }
      })
    }

    const timeoutId = window.setTimeout(
      calcularCuadras,
      160
    )

    return () => {
      activo = false
      window.clearTimeout(timeoutId)
    }
  }, [
    form.geometria,
    form.geometriaTipo,
    mostrarToast,
    recalculoLineaTick,
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
        cuadras:
          value === 'Línea'
            ? prev.cuadras
            : '',
      }))

      setPuntoSeleccionado(null)
      invalidarUbicacionAutoLinea()

      return
    }

    if (name === 'ubicacion') {
      const esLinea =
        esGeometriaLinea(form.geometriaTipo)

      ubicacionLineaManualRef.current =
        esLinea
      ubicacionAutoLineaRef.current = ''

      setUbicacionAutomaticaLinea(false)
      setUbicacionManualLinea(
        esLinea && String(value).trim() !== ''
      )

      setForm((prev) => ({
        ...prev,
        ubicacion: value,
      }))

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
      esGeometriaPunto(form.geometriaTipo) &&
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
      esGeometriaLinea(form.geometriaTipo) &&
      cantidadPuntos < 2
    ) {
      mostrarToast(
        'Para una línea necesitás marcar al menos 2 puntos en el mapa.',
        'error'
      )

      return false
    }

    if (
      esGeometriaPoligono(form.geometriaTipo) &&
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
    invalidarUbicacionAutoLinea()

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
    invalidarUbicacionAutoLinea()

    if (
      esGeometriaLinea(formEditado.geometriaTipo) &&
      formEditado.ubicacion
    ) {
      ubicacionLineaManualRef.current = true
      ubicacionAutoLineaRef.current = ''
      setUbicacionAutomaticaLinea(false)
      setUbicacionManualLinea(true)
    }

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
    invalidarUbicacionAutoLinea()

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
    ubicacionAutomaticaLinea,
    ubicacionManualLinea,
    recalcularUbicacionLinea,

    manejarCambio,

    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,

    hayCambiosSinGuardar,
  }
}
