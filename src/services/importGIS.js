/**
 * Servicio de importacion GIS.
 *
 * Convierte GeoJSON, KML y SHP ZIP a intervenciones internas de EMVIAL Geo.
 */

import { formInicial } from '@constants/formInicial'

function valor(...valores) {
  const encontrado = valores.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      String(item).trim() !== ''
  )

  return encontrado ?? ''
}

function numeroATexto(valorEntrada) {
  if (
    valorEntrada === null ||
    valorEntrada === undefined ||
    valorEntrada === ''
  ) {
    return ''
  }

  const numero = Number(valorEntrada)
  return Number.isFinite(numero)
    ? String(valorEntrada)
    : ''
}

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

function propiedadesNormalizadas(properties = {}) {
  const p = properties || {}

  return {
    nombre: valor(p.nombre, p.name, p.Name, p.NOMBRE),
    mesTerminacion:
      valor(p.mesTerminacion, p.mes_term, p.fecha, p.FECHA),
    obra: valor(p.obra, p.OBRA, formInicial.obra),
    ubicacion:
      valor(p.ubicacion, p.Ubicacion, p.UBICACION, p.location),
    barrio: valor(p.barrio, p.BARRIO),
    estado: valor(p.estado, p.ESTADO, formInicial.estado),
    inspector:
      valor(p.inspector, p.inspect, p.INSPECTOR),
    realizo: valor(p.realizo, p.REALIZO),
    cuadras: numeroATexto(p.cuadras),
    metrosLineales:
      numeroATexto(valor(p.metrosLineales, p.m_lineal)),
    metrosCuadrados:
      numeroATexto(valor(p.metrosCuadrados, p.m2)),
    fuente: valor(p.fuente, p.FUENTE),
    direccion:
      valor(p.direccion, p.DIRECCION, p.address),
    descripcion:
      valor(p.observaciones, p.obs, p.descripcion, p.description),
  }
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
    propiedadesNormalizadas(feature.properties)

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
              properties: {
                nombre,
                descripcion,
              },
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
              properties: {
                nombre,
                descripcion,
              },
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
              properties: {
                nombre,
                descripcion,
              },
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
