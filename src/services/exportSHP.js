/**
 * Servicio de exportacion SHP.
 *
 * Un shapefile solo admite un tipo geometrico por capa. Por eso la descarga
 * genera un ZIP con capas separadas para puntos, lineas y poligonos.
 */

import {
  crearFeatureCollectionIntervenciones,
} from '@services/intervencionesGeoJSON'

const WGS84_PRJ =
  'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]'

const NOMBRES_CAPAS = {
  point: 'emvial_puntos',
  polyline: 'emvial_lineas',
  polygon: 'emvial_poligonos',
}

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

function contarPorTipo(features) {
  return features.reduce(
    (acumulado, feature) => {
      if (feature.geometry.type === 'Point') {
        acumulado.puntos += 1
      }

      if (feature.geometry.type === 'LineString') {
        acumulado.lineas += 1
      }

      if (feature.geometry.type === 'Polygon') {
        acumulado.poligonos += 1
      }

      return acumulado
    },
    {
      puntos: 0,
      lineas: 0,
      poligonos: 0,
    }
  )
}

async function cargarDependenciasShp() {
  const [shpwrite, jszip] =
    await Promise.all([
      import('@mapbox/shp-write'),
      import('jszip'),
    ])

  return {
    shpwrite,
    JSZip: jszip.default,
  }
}

async function agregarArchivosCpg(
  JSZip,
  blobZip,
  conteo
) {
  const zip = await JSZip.loadAsync(blobZip)

  if (conteo.puntos) {
    zip.file(`${NOMBRES_CAPAS.point}.cpg`, 'UTF-8')
  }

  if (conteo.lineas) {
    zip.file(`${NOMBRES_CAPAS.polyline}.cpg`, 'UTF-8')
  }

  if (conteo.poligonos) {
    zip.file(`${NOMBRES_CAPAS.polygon}.cpg`, 'UTF-8')
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'STORE',
  })
}

export async function exportarShpPeriodo(
  intervenciones = [],
  periodoActivo
) {
  if (!intervenciones.length) {
    return {
      ok: false,
      total: 0,
      exportadas: 0,
      omitidas: 0,
      conteo: contarPorTipo([]),
    }
  }

  const featureCollection =
    crearFeatureCollectionIntervenciones(
      intervenciones,
      periodoActivo,
      {
        propiedadesShp: true,
      }
    )

  const exportadas =
    featureCollection.features.length

  if (!exportadas) {
    return {
      ok: false,
      total: intervenciones.length,
      exportadas: 0,
      omitidas: intervenciones.length,
      conteo: contarPorTipo([]),
    }
  }

  const conteo =
    contarPorTipo(featureCollection.features)

  const {
    shpwrite,
    JSZip,
  } = await cargarDependenciasShp()

  const blobZip = await shpwrite.zip(
    featureCollection,
    {
      outputType: 'blob',
      compression: 'STORE',
      prj: WGS84_PRJ,
      types: NOMBRES_CAPAS,
    }
  )

  const blobConCpg =
    await agregarArchivosCpg(
      JSZip,
      blobZip,
      conteo
    )

  descargarBlob(
    blobConCpg,
    `EMVIAL_${nombrePeriodo(periodoActivo)}_SHP.zip`
  )

  return {
    ok: true,
    total: intervenciones.length,
    exportadas,
    omitidas:
      intervenciones.length - exportadas,
    conteo,
  }
}
