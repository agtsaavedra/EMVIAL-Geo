import { useEffect } from 'react'

import { esGeometriaLinea } from './geometryType'

export function useStreetAutoLocation({
  form,
  setForm,
  mostrarToast,
  recalculoLineaTick,
  setUbicacionAutomaticaLinea,
  setUbicacionManualLinea,
  ubicacionAutoLineaRef,
  ubicacionLineaManualRef,
  cuadrasManualRef,
  calculoCuadrasVersionRef,
  advertenciaLineaRef,
  onAutoStreetUpdate,
}) {
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
        const debeActualizarCuadras =
          !cuadrasManualRef.current
        const cuadrasSinCambios =
          !debeActualizarCuadras ||
          prev.cuadras === resultado.cuadras
        const ubicacionSinCambios =
          !debeActualizarUbicacion ||
          prev.ubicacion === resultado.ubicacion

        if (
          cuadrasSinCambios &&
          ubicacionSinCambios
        ) {
          return prev
        }

        const cambiosAutomaticos = {}

        if (
          debeActualizarUbicacion &&
          !ubicacionSinCambios
        ) {
          ubicacionAutoLineaRef.current =
            resultado.ubicacion
          setUbicacionAutomaticaLinea(true)
          setUbicacionManualLinea(false)
          cambiosAutomaticos.ubicacion =
            resultado.ubicacion
        }

        if (
          debeActualizarCuadras &&
          !cuadrasSinCambios
        ) {
          cambiosAutomaticos.cuadras =
            resultado.cuadras
        }

        if (Object.keys(cambiosAutomaticos).length) {
          queueMicrotask(() => {
            onAutoStreetUpdate?.(
              cambiosAutomaticos
            )
          })
        }

        return {
          ...prev,
          cuadras: debeActualizarCuadras
            ? resultado.cuadras
            : prev.cuadras,
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
    setForm,
    setUbicacionAutomaticaLinea,
    setUbicacionManualLinea,
    ubicacionAutoLineaRef,
    ubicacionLineaManualRef,
    cuadrasManualRef,
    calculoCuadrasVersionRef,
    advertenciaLineaRef,
    onAutoStreetUpdate,
  ])
}
