import { useMemo } from 'react'

import { calcularStatsPeriodo } from '@services/periodoStats'

export function useMapStatsDetail(intervenciones = []) {
  return useMemo(
    () => calcularStatsPeriodo(intervenciones),
    [intervenciones]
  )
}
