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
  calculoCuadrasVersionRef,
  advertenciaLineaRef,
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
    setForm,
    setUbicacionAutomaticaLinea,
    setUbicacionManualLinea,
    ubicacionAutoLineaRef,
    ubicacionLineaManualRef,
    calculoCuadrasVersionRef,
    advertenciaLineaRef,
  ])
}
