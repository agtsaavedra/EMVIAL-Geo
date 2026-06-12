import along from '@turf/along'
import bbox from '@turf/bbox'
import booleanIntersects from '@turf/boolean-intersects'
import buffer from '@turf/buffer'
import distance from '@turf/distance'
import length from '@turf/length'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import {
  point,
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
const DISTANCIA_CALLE_CERCANA_KM = 0.045
const DISTANCIA_ESQUINA_KM = 0.055
const TAMANIO_CELDA_GRADOS = 0.01

let callesPromise = null
let callesIndexadas = null
let callesGrid = null

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

function crearIndiceCalles(calles) {
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

function buscarCallesPorBbox(bboxBusqueda) {
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

function crearBboxPunto(lon, lat, margen = 0.0012) {
  return [
    lon - margen,
    lat - margen,
    lon + margen,
    lat + margen,
  ]
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

function obtenerExtremosCalle(feature) {
  const coordinates =
    obtenerLineStrings(feature)[0] || []

  if (coordinates.length < 2) {
    return []
  }

  return [
    point(coordinates[0]),
    point(coordinates[coordinates.length - 1]),
  ]
}

function obtenerAlturaAproximada(properties = {}) {
  const valores = [
    properties.l_f_add,
    properties.l_t_add,
    properties.r_f_add,
    properties.r_t_add,
  ]
    .map(Number)
    .filter(
      (valor) =>
        Number.isFinite(valor) && valor > 0
    )

  if (!valores.length) return ''

  const promedio =
    valores.reduce(
      (total, valor) => total + valor,
      0
    ) / valores.length

  return String(
    Math.round(promedio / 100) * 100
  )
}

function obtenerRangoAlturas(features = []) {
  const valores =
    features.flatMap((feature) => [
      feature.properties?.l_f_add,
      feature.properties?.l_t_add,
      feature.properties?.r_f_add,
      feature.properties?.r_t_add,
    ])
      .map(Number)
      .filter(
        (valor) =>
          Number.isFinite(valor) && valor > 0
      )

  if (!valores.length) return ''

  const min =
    Math.floor(Math.min(...valores) / 100) *
    100
  const max =
    Math.ceil(Math.max(...valores) / 100) *
    100

  if (min === max) {
    return String(min)
  }

  return `${min}/${max}`
}

function obtenerCallePrincipal(
  tramosDetectados
) {
  const conteo = new Map()

  tramosDetectados.forEach((tramo) => {
    if (!tramo.nombre || tramo.nombre === 'Sin nombre') {
      return
    }

    conteo.set(
      tramo.nombre,
      (conteo.get(tramo.nombre) || 0) + 1
    )
  })

  return [...conteo.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}

function construirUbicacionLinea({
  callePrincipal,
  tramosDetectados,
  callesInicio,
  callesFin,
}) {
  const nombre =
    normalizarNombreCalle(callePrincipal)

  if (!nombre) return ''

  const featuresPrincipales =
    tramosDetectados
      .filter(
        (tramo) =>
          tramo.nombre === callePrincipal
      )
      .map((tramo) => tramo.feature)

  const rango =
    obtenerRangoAlturas(
      featuresPrincipales.length
        ? featuresPrincipales
        : tramosDetectados.map(
          (tramo) => tramo.feature
        )
    )

  const entreCalles = [
    callesInicio.find(
      (item) => item !== callePrincipal
    ),
    callesFin.find(
      (item) =>
        item !== callePrincipal &&
        item !== callesInicio[0]
    ) || callesFin.find(
      (item) => item !== callePrincipal
    ),
  ].filter(Boolean)

  const base = rango
    ? `${nombre} ${rango}`
    : nombre

  if (entreCalles.length >= 2) {
    return `${base} e/ ${entreCalles[0]} y ${entreCalles[1]}`
  }

  return base
}

function normalizarNombreCalle(nombre) {
  return String(nombre || '').trim()
}

function buscarCallesCercanasAPunto({
  calles,
  puntoUsuario,
  excluirNombre,
}) {
  return calles
    .map((calle) => {
      const distancias =
        obtenerLineStrings(calle.feature).map(
          (coordinates) => {
            const cercano =
              nearestPointOnLine(
                lineString(coordinates),
                puntoUsuario,
                {
                  units: 'kilometers',
                }
              )

            return Number(
              cercano.properties?.dist
            )
          }
        )

      return {
        nombre: calle.nombre,
        distancia:
          Math.min(...distancias),
      }
    })
    .filter(
      (calle) =>
        calle.nombre &&
        calle.nombre !== 'Sin nombre' &&
        calle.nombre !== excluirNombre &&
        Number.isFinite(calle.distancia) &&
        calle.distancia <=
          DISTANCIA_ESQUINA_KM
    )
    .sort(
      (a, b) => a.distancia - b.distancia
    )
    .map((calle) => calle.nombre)
}

function buscarCallesDeEsquina({
  calles,
  puntoExtremo,
  calleBase,
}) {
  return calles
    .filter((calle) => {
      if (calle.id === calleBase.id) {
        return false
      }

      if (
        calle.nombre === 'Sin nombre' ||
        calle.nombre === calleBase.nombre
      ) {
        return false
      }

      return obtenerExtremosCalle(
        calle.feature
      ).some((extremo) => (
        distance(puntoExtremo, extremo, {
          units: 'kilometers',
        }) <= DISTANCIA_ESQUINA_KM
      ))
    })
    .map((calle) => calle.nombre)
}

function construirUbicacionPunto({
  calle,
  callesExtremoA,
  callesExtremoB,
}) {
  const nombre =
    normalizarNombreCalle(calle.nombre)

  if (!nombre || nombre === 'Sin nombre') {
    return ''
  }

  const altura =
    obtenerAlturaAproximada(
      calle.feature.properties
    )

  const entreCalles = [
    callesExtremoA[0],
    callesExtremoB.find(
      (item) => item !== callesExtremoA[0]
    ) || callesExtremoB[0],
  ].filter(Boolean)

  const base = altura
    ? `${nombre} ${altura}`
    : nombre

  if (entreCalles.length >= 2) {
    return `${base} e/ ${entreCalles[0]} y ${entreCalles[1]}`
  }

  return base
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
        callesGrid =
          crearIndiceCalles(callesIndexadas)

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

      const callesCandidatas =
        buscarCallesPorBbox(bboxBusqueda)

      const tramosDetectados =
      callesCandidatas.filter((calle) => {
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
      const callePrincipal =
        obtenerCallePrincipal(
          tramosDetectados
        )
      const inicio = point(
        linea.geometry.coordinates[0]
      )
      const fin = point(
        linea.geometry.coordinates[
          linea.geometry.coordinates.length - 1
        ]
      )
      const callesInicio =
        buscarCallesCercanasAPunto({
          calles,
          puntoUsuario: inicio,
          excluirNombre: callePrincipal,
        })
      const callesFin =
        buscarCallesCercanasAPunto({
          calles,
          puntoUsuario: fin,
          excluirNombre: callePrincipal,
        })
      const ubicacion =
        construirUbicacionLinea({
          callePrincipal,
          tramosDetectados,
          callesInicio,
          callesFin,
        })

      return {
        cuadras: String(
          tramosDetectados.length
        ),
        metodo: 'red-vial',
        tramos: tramosDetectados.length,
        ubicacion,
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

export async function sugerirUbicacionPunto(
  lat,
  lon
) {
  const latNum = Number(lat)
  const lonNum = Number(lon)

  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lonNum)
  ) {
    return null
  }

  const puntoUsuario = point([
    lonNum,
    latNum,
  ])

  try {
    const calles =
      await cargarCallesIndexadas()

    const callesCandidatas =
      calles.length
        ? buscarCallesPorBbox(
        crearBboxPunto(lonNum, latNum)
      )
        : calles

    const candidatos = callesCandidatas
      .map((calle) => {
        const distancias =
          obtenerLineStrings(
            calle.feature
          ).map((coordinates) => {
            const cercano =
              nearestPointOnLine(
                lineString(coordinates),
                puntoUsuario,
                {
                  units: 'kilometers',
                }
              )

            return Number(
              cercano.properties?.dist
            )
          })

        return {
          ...calle,
          distancia:
            Math.min(...distancias),
        }
      })
      .filter(
        (calle) =>
          calle.nombre !== 'Sin nombre' &&
          Number.isFinite(calle.distancia) &&
          calle.distancia <=
            DISTANCIA_CALLE_CERCANA_KM
      )
      .sort(
        (a, b) => a.distancia - b.distancia
      )

    const calle = candidatos[0]

    if (!calle) return null

    const [extremoA, extremoB] =
      obtenerExtremosCalle(calle.feature)

    const callesExtremoA = extremoA
      ? buscarCallesDeEsquina({
        calles,
        puntoExtremo: extremoA,
        calleBase: calle,
      })
      : []

    const callesExtremoB = extremoB
      ? buscarCallesDeEsquina({
        calles,
        puntoExtremo: extremoB,
        calleBase: calle,
      })
      : []

    const ubicacion =
      construirUbicacionPunto({
        calle,
        callesExtremoA,
        callesExtremoB,
      })

    if (!ubicacion) return null

    return {
      ubicacion,
      calle: calle.nombre,
      distanciaMetros:
        calle.distancia * 1000,
    }
  } catch (error) {
    console.warn(
      'No se pudo sugerir ubicacion del punto:',
      error
    )

    return null
  }
}
