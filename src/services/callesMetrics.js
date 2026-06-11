import along from '@turf/along'
import bbox from '@turf/bbox'
import booleanIntersects from '@turf/boolean-intersects'
import buffer from '@turf/buffer'
import length from '@turf/length'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import {
  lineString,
} from '@turf/helpers'
import {
  calcularLongitudLineaMetros,
} from '@services/geometryMetrics'
import {
  leerGeojsonDatos,
} from '@services/staticData'

const DISTANCIA_BUFFER_KM = 0.018
const DISTANCIA_PUNTO_MEDIO_KM = 0.024

let callesPromise = null
let callesIndexadas = null

function expandirBbox(bbox, margen = 0.00022) {
  return [
    bbox[0] - margen,
    bbox[1] - margen,
    bbox[2] + margen,
    bbox[3] + margen,
  ]
}

function bboxIntersecta(a, b) {
  return !(
    a[2] < b[0] ||
    a[0] > b[2] ||
    a[3] < b[1] ||
    a[1] > b[3]
  )
}

function geometriaAppALineString(geometria) {
  return lineString(
    geometria.map(([lat, lng]) => [
      Number(lng),
      Number(lat),
    ])
  )
}

function normalizarFeatureCalle(feature, index) {
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

function obtenerLineStrings(feature) {
  if (feature.geometry?.type === 'LineString') {
    return [feature.geometry.coordinates]
  }

  if (
    feature.geometry?.type ===
    'MultiLineString'
  ) {
    return feature.geometry.coordinates
  }

  return []
}

function puntoMedioLinea(coordinates) {
  const line = lineString(coordinates)
  const longitud = length(line, {
    units: 'kilometers',
  })

  if (!longitud) return null

  return along(line, longitud / 2, {
    units: 'kilometers',
  })
}

function tienePuntoMedioCercano(
  calleFeature,
  lineaUsuario
) {
  return obtenerLineStrings(calleFeature).some(
    (coordinates) => {
      const medio =
        puntoMedioLinea(coordinates)

      if (!medio) return false

      const cercano =
        nearestPointOnLine(
          lineaUsuario,
          medio,
          {
            units: 'kilometers',
          }
        )

      return (
        Number(cercano.properties?.dist) <=
        DISTANCIA_PUNTO_MEDIO_KM
      )
    }
  )
}

async function cargarCallesIndexadas() {
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

        return callesIndexadas
      })
  }

  return callesPromise
}

function calcularCuadrasPorDistancia(geometria) {
  const metros =
    calcularLongitudLineaMetros(geometria)

  if (!metros) return 0

  return metros / 100
}

function formatearCuadras(valor) {
  if (!Number.isFinite(valor) || valor <= 0) {
    return ''
  }

  if (Number.isInteger(valor)) {
    return String(valor)
  }

  return valor.toFixed(2)
}

export async function calcularCuadrasLinea(
  geometria
) {
  if (
    !Array.isArray(geometria) ||
    geometria.length < 2
  ) {
    return {
      cuadras: '',
      metodo: 'sin-geometria',
      tramos: 0,
    }
  }

  const linea = geometriaAppALineString(
    geometria
  )
  const bufferLinea = buffer(
    linea,
    DISTANCIA_BUFFER_KM,
    {
      units: 'kilometers',
    }
  )
  const bboxBusqueda = expandirBbox(
    bbox(bufferLinea)
  )

  try {
    const calles =
      await cargarCallesIndexadas()

    const tramosDetectados =
      calles.filter((calle) => {
        if (
          !bboxIntersecta(
            bboxBusqueda,
            calle.bbox
          )
        ) {
          return false
        }

        return booleanIntersects(
          bufferLinea,
          calle.feature
        ) &&
          tienePuntoMedioCercano(
            calle.feature,
            linea
          )
      })

    if (tramosDetectados.length > 0) {
      return {
        cuadras: String(
          tramosDetectados.length
        ),
        metodo: 'red-vial',
        tramos: tramosDetectados.length,
        calles: [
          ...new Set(
            tramosDetectados
              .map((tramo) => tramo.nombre)
              .filter(Boolean)
          ),
        ].slice(0, 5),
      }
    }
  } catch (error) {
    console.warn(
      'Fallback de cuadras por distancia:',
      error
    )
  }

  const cuadrasEstimadas =
    calcularCuadrasPorDistancia(geometria)

  return {
    cuadras: formatearCuadras(
      cuadrasEstimadas
    ),
    metodo: 'distancia-100m',
    tramos: 0,
  }
}
