/**
 * Servicio de importacion GIS.
 *
 * Convierte GeoJSON, KML y SHP ZIP a intervenciones internas de EMVIAL Geo.
 */

import { formInicial } from '@constants/formInicial'
import {
  crearImportIntervencionDTO,
} from '@services/importIntervencionDTO'

function puntoGeoJSONALatLng(coordenadas) {
  if (
    !Array.isArray(coordenadas) ||
    coordenadas.length < 2
  ) {
    return null
  }

  const lng = Number(coordenadas[0])
  const lat = Number(coordenadas[1])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return [lat, lng]
}

function geometriaDesdeGeoJSON(geometry) {
  if (!geometry) return null

  if (geometry.type === 'Point') {
    const punto =
      puntoGeoJSONALatLng(geometry.coordinates)

    if (!punto) return null

    return {
      geometriaTipo: 'Punto',
      geometria: [punto],
      latitud: punto[0].toFixed(6),
      longitud: punto[1].toFixed(6),
    }
  }

  if (geometry.type === 'LineString') {
    const puntos = geometry.coordinates
      .map(puntoGeoJSONALatLng)
      .filter(Boolean)

    if (puntos.length < 2) return null

    const ultimo =
      puntos[puntos.length - 1]

    return {
      geometriaTipo: 'Línea',
      geometria: puntos,
      latitud: ultimo[0].toFixed(6),
      longitud: ultimo[1].toFixed(6),
    }
  }

  if (geometry.type === 'Polygon') {
    const anillo =
      geometry.coordinates?.[0] || []

    const puntos = anillo
      .map(puntoGeoJSONALatLng)
      .filter(Boolean)

    if (puntos.length < 4) return null

    const primero = puntos[0]
    const ultimo = puntos[puntos.length - 1]
    const estaCerrado =
      primero[0] === ultimo[0] &&
      primero[1] === ultimo[1]

    const geometria = estaCerrado
      ? puntos.slice(0, -1)
      : puntos

    if (geometria.length < 3) return null

    const puntoFinal =
      geometria[geometria.length - 1]

    return {
      geometriaTipo: 'Polígono',
      geometria,
      latitud: puntoFinal[0].toFixed(6),
      longitud: puntoFinal[1].toFixed(6),
    }
  }

  return null
}

function featureAIntervencion(
  feature,
  periodoActivo,
  nombreArchivo
) {
  const geometria =
    geometriaDesdeGeoJSON(feature.geometry)

  if (!geometria) return null

  const props =
    crearImportIntervencionDTO(
      feature.properties,
      {
        obraDefault: formInicial.obra,
      }
    )

  return {
    ...formInicial,
    ...props,
    ...geometria,
    periodo: periodoActivo,
    fuente:
      props.fuente ||
      `Importado: ${nombreArchivo}`,
  }
}

function normalizarFeatureCollections(geojson) {
  if (!geojson) return []

  if (Array.isArray(geojson)) {
    return geojson.flatMap(normalizarFeatureCollections)
  }

  if (geojson.type === 'FeatureCollection') {
    return geojson.features || []
  }

  if (geojson.type === 'Feature') {
    return [geojson]
  }

  return []
}

async function leerGeoJSON(file) {
  return JSON.parse(await file.text())
}

function textoNodo(nodo, selector) {
  return nodo
    .querySelector(selector)
    ?.textContent
    ?.trim() || ''
}

function extraerPropiedadesDescripcion(descripcion) {
  if (!descripcion) return {}

  const doc = new DOMParser()
    .parseFromString(
      descripcion,
      'text/html'
    )

  const propiedades = {}

  doc.querySelectorAll('tr').forEach((fila) => {
    const celdas = [
      ...fila.querySelectorAll('td'),
    ]

    if (celdas.length < 2) return

    const clave = celdas[0]
      .textContent
      ?.trim()
    const valor = celdas[1]
      .textContent
      ?.trim()

    if (clave && valor) {
      propiedades[clave] = valor
    }
  })

  if (!Object.keys(propiedades).length) {
    propiedades.descripcion = descripcion
  }

  return propiedades
}

function propiedadesKml(nombre, descripcion) {
  return {
    nombre,
    ...extraerPropiedadesDescripcion(descripcion),
  }
}

function coordenadasKml(texto) {
  return texto
    .trim()
    .split(/\s+/)
    .map((coord) => {
      const [lng, lat] = coord
        .split(',')
        .map(Number)

      return [lng, lat]
    })
    .filter(
      ([lng, lat]) =>
        Number.isFinite(lng) &&
        Number.isFinite(lat)
    )
}

function leerKml(file) {
  return file.text().then((texto) => {
    const xml = new DOMParser()
      .parseFromString(
        texto,
        'application/xml'
      )

    const placemarks = [
      ...xml.querySelectorAll('Placemark'),
    ]

    return {
      type: 'FeatureCollection',
      features: placemarks
        .map((placemark) => {
          const nombre =
            textoNodo(placemark, 'name')

          const descripcion =
            textoNodo(placemark, 'description')

          const punto =
            textoNodo(placemark, 'Point coordinates')

          if (punto) {
            return {
              type: 'Feature',
              properties:
                propiedadesKml(nombre, descripcion),
              geometry: {
                type: 'Point',
                coordinates:
                  coordenadasKml(punto)[0],
              },
            }
          }

          const linea =
            textoNodo(placemark, 'LineString coordinates')

          if (linea) {
            return {
              type: 'Feature',
              properties:
                propiedadesKml(nombre, descripcion),
              geometry: {
                type: 'LineString',
                coordinates:
                  coordenadasKml(linea),
              },
            }
          }

          const poligono =
            textoNodo(placemark, 'Polygon coordinates')

          if (poligono) {
            return {
              type: 'Feature',
              properties:
                propiedadesKml(nombre, descripcion),
              geometry: {
                type: 'Polygon',
                coordinates: [
                  coordenadasKml(poligono),
                ],
              },
            }
          }

          return null
        })
        .filter(Boolean),
    }
  })
}

async function leerShpZip(file) {
  const shp = await import('shpjs')
  const arrayBuffer =
    await file.arrayBuffer()

  return shp.default(arrayBuffer)
}

export async function importarArchivoGIS(
  file,
  periodoActivo
) {
  const nombre =
    file?.name || 'archivo'

  const extension = nombre
    .toLowerCase()
    .split('.')
    .pop()

  let geojson

  if (
    extension === 'geojson' ||
    extension === 'json'
  ) {
    geojson = await leerGeoJSON(file)
  } else if (extension === 'kml') {
    geojson = await leerKml(file)
  } else if (extension === 'zip') {
    geojson = await leerShpZip(file)
  } else {
    throw new Error('Formato GIS no soportado')
  }

  const features =
    normalizarFeatureCollections(geojson)

  const intervenciones = features
    .map((feature) =>
      featureAIntervencion(
        feature,
        periodoActivo,
        nombre
      )
    )
    .filter(Boolean)

  return {
    total: features.length,
    importables: intervenciones.length,
    omitidas:
      features.length - intervenciones.length,
    intervenciones,
  }
}
