/*
  useAppData

  Agrupa los hooks de datos principales:
  intervenciones, período activo, backups y filtros derivados.

  Mantiene concentrada la información persistente y las listas calculadas
  que consume el resto de la aplicación.
*/

import { useIntervenciones } from '@hooks/data/useIntervenciones'
import { usePeriodo } from '@hooks/data/usePeriodo'
import { useBackups } from '@hooks/data/useBackups'
import { useFiltrosIntervenciones } from '@hooks/data/useFiltrosIntervenciones'

export function useAppData({
  busquedaDebounced,
  filtroObra,
  filtroEstado,
}) {
  const {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    eliminarIntervencion,
    recargarIntervenciones,
    restaurarIntervencion,
    duplicarIntervencion,
  } = useIntervenciones()

  const {
    periodoActivo,
    setPeriodoActivo,
  } = usePeriodo()

  const {
    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,
  } = useBackups({
    periodoActivo,
    recargarIntervenciones,
  })

  const {
    intervencionesDelPeriodo,
    intervencionesFiltradas,
  } = useFiltrosIntervenciones({
    intervenciones,
    periodoActivo,
    busqueda: busquedaDebounced,
    filtroObra,
    filtroEstado,
  })

  return {
    intervenciones,

    intervencionEditandoId,
    setIntervencionEditandoId,

    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    eliminarIntervencion,
    restaurarIntervencion,
    duplicarIntervencion,
    recargarIntervenciones,

    periodoActivo,
    setPeriodoActivo,

    crearBackup,
    restaurarBackup,
    restaurarPeriodoActual,

    intervencionesDelPeriodo,
    intervencionesFiltradas,
  }
}
