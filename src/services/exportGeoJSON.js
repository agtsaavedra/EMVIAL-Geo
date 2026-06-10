/**
 * Servicio de exportacion GeoJSON.
 *
 * GeoJSON funciona como formato GIS abierto y como puente interno para otras
 * exportaciones, especialmente SHP.
 */

import {
  crearFeatureCollectionIntervenciones,
} from '@services/intervencionesGeoJSON'

function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = nombreArchivo
  link.click()

  URL.revokeObjectURL(url)
}

function nombrePeriodo(periodoActivo) {
  return periodoActivo || 'sin_periodo'
}

export function exportarGeoJSONPeriodo(
  intervenciones = [],
  periodoActivo
) {
  if (!intervenciones.length) {
    return {
      ok: false,
      total: 0,
      exportadas: 0,
      omitidas: 0,
    }
  }

  const featureCollection =
    crearFeatureCollectionIntervenciones(
      intervenciones,
      periodoActivo
    )

  const exportadas =
    featureCollection.features.length

  if (!exportadas) {
    return {
      ok: false,
      total: intervenciones.length,
      exportadas: 0,
      omitidas: intervenciones.length,
    }
  }

  const blob = new Blob(
    [JSON.stringify(featureCollection, null, 2)],
    {
      type: 'application/geo+json;charset=utf-8',
    }
  )

  descargarBlob(
    blob,
    `EMVIAL_${nombrePeriodo(periodoActivo)}.geojson`
  )

  return {
    ok: true,
    total: intervenciones.length,
    exportadas,
    omitidas:
      intervenciones.length - exportadas,
  }
}
