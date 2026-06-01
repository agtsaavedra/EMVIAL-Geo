import { useEffect, useRef, useState } from 'react'

export function useGeometryEditing({
  form,
  setForm,
  intervencionesFiltradas,
  intervencionEditandoId,
  setPuntoSeleccionado,
}) {
  const [cursorLinea, setCursorLinea] = useState(null)

  const [
    redibujandoGeometria,
    setRedibujandoGeometria,
  ] = useState(false)

  const [
    edicionGeometricaIniciada,
    setEdicionGeometricaIniciada,
  ] = useState(false)

  const geometriaOriginalRef = useRef(null)

  function deshacerPunto() {
    let nuevoUltimoPunto = null

    setForm((prev) => {
      const nuevaGeometria =
        (prev.geometria || []).slice(0, -1)

      nuevoUltimoPunto =
        nuevaGeometria[nuevaGeometria.length - 1] || null

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

  function restaurarGeometriaOriginal() {
    const original = geometriaOriginalRef.current

    if (!original) return

    setForm((prev) => ({
      ...prev,
      geometriaTipo: original.geometriaTipo,
      geometria: original.geometria,
      direccion: original.direccion,
      latitud: original.latitud,
      longitud: original.longitud,
      barrio: original.barrio,
    }))

    setCursorLinea(null)
    setPuntoSeleccionado(null)
    setRedibujandoGeometria(false)
  }

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

  useEffect(() => {
    if (!intervencionEditandoId) {
      setRedibujandoGeometria(false)
    }
  }, [intervencionEditandoId])

  useEffect(() => {
    if (!intervencionEditandoId) {
      geometriaOriginalRef.current = null
      setEdicionGeometricaIniciada(false)
      return
    }

    const original = intervencionesFiltradas.find(
      (item) => item.id === intervencionEditandoId
    )

    if (!original) return

    geometriaOriginalRef.current = {
      geometriaTipo: original.geometriaTipo || 'Punto',
      geometria: original.geometria || [],
      direccion: original.direccion || '',
      latitud: original.latitud || '',
      longitud: original.longitud || '',
      barrio: original.barrio || '',
    }

    setEdicionGeometricaIniciada(false)
  }, [
    intervencionEditandoId,
    intervencionesFiltradas,
  ])

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