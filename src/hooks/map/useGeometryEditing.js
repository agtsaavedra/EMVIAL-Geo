/**
 * Hook de edición geométrica.
 *
 * Centraliza la lógica de dibujo/redibujo del mapa: deshacer puntos, limpiar
 * ubicación, restaurar geometría original y manejar el modo dibujo.
 */

import { useEffect, useRef, useState } from 'react'

// Punto de entrada público del hook.
export function useGeometryEditing({
  form,
  setForm,
  intervencionesFiltradas,
  intervencionEditandoId,
  setPuntoSeleccionado,
}) {
  // =====================================================
  // ESTADO DE PREVIEW / EDICIÓN
  // =====================================================

  // Posición actual del mouse mientras se dibuja
  // una línea o un polígono.
  const [cursorLinea, setCursorLinea] =
    useState(null)

  // Indica que la geometría guardada debe ocultarse
  // porque el usuario está redibujando una intervención existente.
  const [
    redibujandoGeometria,
    setRedibujandoGeometria,
  ] = useState(false)

  // Indica si el usuario ya modificó realmente
  // la geometría durante una edición.
  const [
    edicionGeometricaIniciada,
    setEdicionGeometricaIniciada,
  ] = useState(false)

  // Snapshot de la geometría original al entrar en edición.
  // Sirve para restaurar si el usuario activa/desactiva dibujo
  // sin haber modificado la geometría.
  const geometriaOriginalRef = useRef(null)

  // =====================================================
  // DESHACER ÚLTIMO PUNTO
  // =====================================================
  // Elimina el último punto de una línea/polígono activo.
  // Si estamos editando una intervención existente,
  // oculta la versión guardada para mostrar solo la editable.

  // Elimina el último punto dibujado de una línea o polígono.
  function deshacerPunto() {
    let nuevoUltimoPunto = null

    setForm((prev) => {
      const nuevaGeometria =
        (prev.geometria || []).slice(0, -1)

      nuevoUltimoPunto =
        nuevaGeometria[
          nuevaGeometria.length - 1
        ] || null

      return {
        ...prev,
        geometria: nuevaGeometria,

        latitud: nuevoUltimoPunto
          ? nuevoUltimoPunto[0].toFixed(6)
          : '',

        longitud: nuevoUltimoPunto
          ? nuevoUltimoPunto[1].toFixed(6)
          : '',

        barrio:
          nuevaGeometria.length === 0
            ? ''
            : prev.barrio,
      }
    })

    setPuntoSeleccionado(nuevoUltimoPunto)
    setCursorLinea(null)

    if (intervencionEditandoId) {
      setRedibujandoGeometria(true)
      setEdicionGeometricaIniciada(true)
    }
  }

  // =====================================================
  // LIMPIAR UBICACIÓN / GEOMETRÍA
  // =====================================================
  // Limpia dirección, coordenadas, barrio y geometría.
  // En edición, marca que se está redibujando para ocultar
  // la geometría guardada anterior.

  // Borra dirección, coordenadas, barrio y geometría del formulario.
  function limpiarUbicacion() {
    setForm((prev) => ({
      ...prev,

      direccion: '',
      latitud: '',
      longitud: '',
      barrio: '',
      geometria: [],
    }))

    setPuntoSeleccionado(null)
    setCursorLinea(null)

    if (intervencionEditandoId) {
      setRedibujandoGeometria(true)
      setEdicionGeometricaIniciada(true)
    }
  }

  // =====================================================
  // RESTAURAR GEOMETRÍA ORIGINAL
  // =====================================================
  // Devuelve el formulario a la geometría original
  // guardada al iniciar edición.

  // Recupera la geometría existente al comenzar una edición.
  function restaurarGeometriaOriginal() {
    const original =
      geometriaOriginalRef.current

    if (!original) return

    setForm((prev) => ({
      ...prev,

      geometriaTipo:
        original.geometriaTipo,

      geometria:
        original.geometria,

      direccion:
        original.direccion,

      latitud:
        original.latitud,

      longitud:
        original.longitud,

      barrio:
        original.barrio,
    }))

    setCursorLinea(null)
    setPuntoSeleccionado(null)
    setRedibujandoGeometria(false)
  }

  // =====================================================
  // CAMBIAR TIPO DE GEOMETRÍA
  // =====================================================
  // Si estamos editando y todavía no se modificó la geometría,
  // permite cambiar visualmente el tipo sin destruir el original.
  //
  // Si ya hubo edición real, cambiar tipo limpia geometría
  // para evitar combinaciones inconsistentes.

  // Cambia el tipo de geometría evitando combinaciones inconsistentes.
  function cambiarGeometriaTipo(tipo) {
    if (
      intervencionEditandoId &&
      !edicionGeometricaIniciada
    ) {
      setForm((prev) => ({
        ...prev,
        geometriaTipo: tipo,
      }))

      return
    }

    setForm((prev) => ({
      ...prev,
      geometriaTipo: tipo,
      geometria: [],
      latitud: '',
      longitud: '',
    }))

    setPuntoSeleccionado(null)
    setCursorLinea(null)

    if (intervencionEditandoId) {
      setRedibujandoGeometria(true)
      setEdicionGeometricaIniciada(true)
    }
  }

  // =====================================================
  // ACTIVAR / DESACTIVAR MODO DIBUJO
  // =====================================================
  // Centraliza el comportamiento del toggle de modo dibujo.
  //
  // Al apagar:
  // - limpia preview
  // - si no hubo cambios reales, restaura la geometría original
  //
  // Al activar:
  // - si se edita un polígono, limpia la geometría para redibujarla

  // Coordina los efectos de activar o desactivar el modo dibujo.
  function manejarCambioModoDibujo({
    activo,
    setModoDibujo,
  }) {
    setModoDibujo(activo)
    setCursorLinea(null)

    const editando =
      Boolean(intervencionEditandoId)

    if (!activo) {
      if (
        editando &&
        !edicionGeometricaIniciada
      ) {
        restaurarGeometriaOriginal()
        return
      }

      setRedibujandoGeometria(false)
      return
    }

    if (
      editando &&
      form.geometriaTipo === 'Polígono'
    ) {
      setForm((prev) => ({
        ...prev,
        geometria: [],
      }))

      setPuntoSeleccionado(null)
      setRedibujandoGeometria(true)
    }
  }

  // =====================================================
  // RESET AL SALIR DE EDICIÓN
  // =====================================================

  useEffect(() => {
    if (!intervencionEditandoId) {
      setRedibujandoGeometria(false)
    }
  }, [intervencionEditandoId])

  // =====================================================
  // SNAPSHOT DE GEOMETRÍA ORIGINAL
  // =====================================================
  // Cada vez que se entra a editar una intervención,
  // guardamos una copia de su geometría original.

  useEffect(() => {
    if (!intervencionEditandoId) {
      geometriaOriginalRef.current = null
      setEdicionGeometricaIniciada(false)
      return
    }

    const original =
      intervencionesFiltradas.find(
        (item) =>
          item.id ===
          intervencionEditandoId
      )

    if (!original) return

    geometriaOriginalRef.current = {
      geometriaTipo:
        original.geometriaTipo ||
        'Punto',

      geometria:
        original.geometria || [],

      direccion:
        original.direccion || '',

      latitud:
        original.latitud || '',

      longitud:
        original.longitud || '',

      barrio:
        original.barrio || '',
    }

    setEdicionGeometricaIniciada(false)
  }, [
    intervencionEditandoId,
    intervencionesFiltradas,
  ])

  // =====================================================
  // API DEL HOOK
  // =====================================================

  return {
    cursorLinea,
    setCursorLinea,

    redibujandoGeometria,
    setRedibujandoGeometria,

    edicionGeometricaIniciada,
    setEdicionGeometricaIniciada,

    deshacerPunto,
    limpiarUbicacion,
    restaurarGeometriaOriginal,
    cambiarGeometriaTipo,
    manejarCambioModoDibujo,
  }
}
