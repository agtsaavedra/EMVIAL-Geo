import { useEffect } from 'react'

import {
  calcularAreaPoligonoMetrosCuadrados,
  calcularLongitudLineaMetros,
  formatearMetrosCuadradosFormulario,
  formatearMetrosFormulario,
} from '@services/geometryMetrics'

import {
  esGeometriaLinea,
  esGeometriaPoligono,
} from './geometryType'

export function useGeometryMetricsForm({
  form,
  setForm,
  onAutoMetricsUpdate,
}) {
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

      queueMicrotask(() => {
        onAutoMetricsUpdate?.({
          metrosLineales: metrosFormateados,
        })
      })

      return {
        ...prev,
        metrosLineales:
          metrosFormateados,
      }
    })
  }, [
    form.geometria,
    form.geometriaTipo,
    onAutoMetricsUpdate,
    setForm,
  ])

  useEffect(() => {
    if (!esGeometriaPoligono(form.geometriaTipo)) {
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

      queueMicrotask(() => {
        onAutoMetricsUpdate?.({
          metrosCuadrados: areaFormateada,
        })
      })

      return {
        ...prev,
        metrosCuadrados:
          areaFormateada,
      }
    })
  }, [
    form.geometria,
    form.geometriaTipo,
    onAutoMetricsUpdate,
    setForm,
  ])
}
