/**
 * Hook controlador del formulario de intervención.
 *
 * Administra estado del formulario, validación geométrica, edición, cancelación
 * y detección de cambios sin guardar. También sincroniza estados externos del
 * mapa y filtros.
 */

import {
  useEffect,
  useState,
} from 'react'

import { formInicial } from '@constants/formInicial'

import {
  esGeometriaLinea,
} from './geometryType'
import {
  tieneCambiosSinGuardar,
} from './formState'
import {
  useGeometryMetricsForm,
} from './useGeometryMetricsForm'
import {
  useInterventionFormActions,
} from './useInterventionFormActions'
import {
  useLineLocationState,
} from './useLineLocationState'
import {
  useStreetAutoLocation,
} from './useStreetAutoLocation'

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

  const {
    ubicacionAutomaticaLinea,
    ubicacionManualLinea,
    recalculoLineaTick,
    setUbicacionAutomaticaLinea,
    setUbicacionManualLinea,
    ubicacionAutoLineaRef,
    ubicacionLineaManualRef,
    calculoCuadrasVersionRef,
    advertenciaLineaRef,
    invalidarUbicacionAutoLinea,
    recalcularUbicacionLinea,
    marcarUbicacionLineaManual,
    restaurarUbicacionLineaManual,
  } = useLineLocationState()

  useGeometryMetricsForm({
    form,
    setForm,
  })

  useStreetAutoLocation({
    form,
    setForm,
    mostrarToast,
    recalculoLineaTick,
    setUbicacionAutomaticaLinea,
    setUbicacionManualLinea,
    ubicacionAutoLineaRef,
    ubicacionLineaManualRef,
    calculoCuadrasVersionRef,
    advertenciaLineaRef,
  })

  const {
    guardarIntervencion,
    editarIntervencion,
    cancelarEdicion,
  } = useInterventionFormActions({
    form,
    setForm,
    setFormOriginal,
    periodoActivo,
    guardarIntervencionEnDB,
    setIntervencionEditandoId,
    setPuntoSeleccionado,
    setBarrioSeleccionado,
    setSugerencias,
    setBuscandoDireccion,
    mostrarToast,
    invalidarUbicacionAutoLinea,
    restaurarUbicacionLineaManual,
  })

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
    invalidarUbicacionAutoLinea,
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

      if (esLinea) {
        marcarUbicacionLineaManual(value)
      } else {
        invalidarUbicacionAutoLinea()
      }

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
  // =====================================================
  // GUARDAR / ACTUALIZAR
  // =====================================================

  // Valida y guarda la intervención actual del formulario.
  // =====================================================
  // EDITAR INTERVENCIÓN
  // =====================================================

  // Carga una intervención existente en el formulario para editarla.
  // =====================================================
  // CANCELAR EDICIÓN
  // =====================================================

  // Sale del modo edición y limpia estado asociado.
  // =====================================================
  // DIRTY STATE
  // =====================================================
  // Detecta si hubo cambios desde que se abrió la intervención.
  //
  // En edición compara contra la copia original.
  // En intervención nueva revisa si el usuario ya cargó datos o geometría.

  const hayCambiosSinGuardar =
    tieneCambiosSinGuardar(
      form,
      formOriginal
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
