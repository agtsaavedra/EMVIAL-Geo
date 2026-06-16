import bbox from '@turf/bbox'

import {
  leerGeojsonDatos,
} from '@services/staticData'
import {
  bboxIntersecta,
} from '@services/streetNetwork/geometry'

const TAMANIO_CELDA_GRADOS = 0.01

let callesPromise = null
let callesIndexadas = null
let callesGrid = null

function obtenerRangoCeldas(bbox) {
  const minX = Math.floor(
    bbox[0] / TAMANIO_CELDA_GRADOS
  )
  const minY = Math.floor(
    bbox[1] / TAMANIO_CELDA_GRADOS
  )
  const maxX = Math.floor(
    bbox[2] / TAMANIO_CELDA_GRADOS
  )
  const maxY = Math.floor(
    bbox[3] / TAMANIO_CELDA_GRADOS
  )

  return {
    minX,
    minY,
    maxX,
    maxY,
  }
}

export function normalizarFeatureCalle(feature, index) {
  const id =
    feature.properties?.cartodb_id ||
    feature.properties?.cod_calles ||
    index

  return {
    id,
    feature,
    bbox: bbox(feature),
    nombre:
      feature.properties?.nom_comple ||
      'Sin nombre',
  }
}

export function crearIndiceCalles(calles) {
  const grid = new Map()

  calles.forEach((calle) => {
    const {
      minX,
      minY,
      maxX,
      maxY,
    } = obtenerRangoCeldas(calle.bbox)

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const key = `${x}:${y}`
        const existentes =
          grid.get(key) || []

        existentes.push(calle)
        grid.set(key, existentes)
      }
    }
  })

  return grid
}

export function buscarCallesPorBbox(bboxBusqueda) {
  if (!callesGrid) {
    return callesIndexadas || []
  }

  const {
    minX,
    minY,
    maxX,
    maxY,
  } = obtenerRangoCeldas(bboxBusqueda)
  const candidatas = new Map()

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      const key = `${x}:${y}`
      const calles =
        callesGrid.get(key) || []

      calles.forEach((calle) => {
        candidatas.set(calle.id, calle)
      })
    }
  }

  return [...candidatas.values()]
    .filter((calle) =>
      bboxIntersecta(
        bboxBusqueda,
        calle.bbox
      )
    )
}

export async function cargarCallesIndexadas() {
  if (callesIndexadas) {
    return callesIndexadas
  }

  if (!callesPromise) {
    callesPromise = leerGeojsonDatos(
      'calles-mar-del-plata.geojson'
    )
      .then((geojson) => {
        callesIndexadas =
          (geojson.features || [])
            .filter((feature) =>
              [
                'LineString',
                'MultiLineString',
              ].includes(
                feature.geometry?.type
              )
            )
            .map(normalizarFeatureCalle)
        callesGrid =
          crearIndiceCalles(callesIndexadas)

        return callesIndexadas
      })
  }

  return callesPromise
}
