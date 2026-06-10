/**
 * Conversores GIS para intervenciones.
 *
 * La app guarda coordenadas como [lat, lng] porque Leaflet consume ese orden.
 * GeoJSON, SHP y la mayoria de herramientas GIS esperan [lng, lat].
 */

function esNumeroValido(valor) {
  return Number.isFinite(Number(valor))
}

function puntoLatLngAGeoJSON(punto) {
  if (!Array.isArray(punto) || punto.length < 2) {
    return null
  }

  const lat = Number(punto[0])
  const lng = Number(punto[1])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return [lng, lat]
}

function cerrarAnillo(coordenadas) {
  if (!coordenadas.length) return coordenadas

  const primera = coordenadas[0]
  const ultima = coordenadas[coordenadas.length - 1]

  if (primera[0] === ultima[0] && primera[1] === ultima[1]) {
    return coordenadas
  }

  return [...coordenadas, primera]
}

function geometriaLinealValida(geometria, minimoPuntos) {
  return (
    Array.isArray(geometria) &&
    geometria.length >= minimoPuntos
  )
}

function crearGeometriaGeoJSON(intervencion) {
  const tipo = intervencion.geometriaTipo

  if (
    tipo === 'Linea' ||
    tipo === 'Línea'
  ) {
    if (!geometriaLinealValida(intervencion.geometria, 2)) {
      return null
    }

    const coordenadas = intervencion.geometria
      .map(puntoLatLngAGeoJSON)
      .filter(Boolean)

    if (coordenadas.length < 2) return null

    return {
      type: 'LineString',
      coordinates: coordenadas,
    }
  }

  if (
    tipo === 'Poligono' ||
    tipo === 'Polígono'
  ) {
    if (!geometriaLinealValida(intervencion.geometria, 3)) {
      return null
    }

    const coordenadas = intervencion.geometria
      .map(puntoLatLngAGeoJSON)
      .filter(Boolean)

    if (coordenadas.length < 3) return null

    return {
      type: 'Polygon',
      coordinates: [cerrarAnillo(coordenadas)],
    }
  }

  if (
    esNumeroValido(intervencion.latitud) &&
    esNumeroValido(intervencion.longitud)
  ) {
    return {
      type: 'Point',
      coordinates: [
        Number(intervencion.longitud),
        Number(intervencion.latitud),
      ],
    }
  }

  return null
}

export function obtenerEstadoGeometriaIntervencion(intervencion) {
  const geometry =
    crearGeometriaGeoJSON(intervencion)

  if (!geometry) {
    return {
      valida: false,
      tipo: intervencion?.geometriaTipo || '',
    }
  }

  return {
    valida: true,
    tipo: geometry.type,
  }
}

function valorPropiedad(valor) {
  return valor ?? ''
}

function numeroPropiedad(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

function textoPropiedad(valor) {
  if (valor === null || valor === undefined) {
    return ''
  }

  return String(valor)
}

function crearPropiedadesCompletas(intervencion, periodoActivo) {
  return {
    id: valorPropiedad(intervencion.id),
    periodo:
      valorPropiedad(intervencion.periodo) ||
      valorPropiedad(periodoActivo),
    nombre: valorPropiedad(intervencion.nombre),
    mesTerminacion:
      valorPropiedad(intervencion.mesTerminacion),
    obra: valorPropiedad(intervencion.obra),
    ubicacion: valorPropiedad(intervencion.ubicacion),
    barrio: valorPropiedad(intervencion.barrio),
    estado: valorPropiedad(intervencion.estado),
    inspector: valorPropiedad(intervencion.inspector),
    realizo: valorPropiedad(intervencion.realizo),
    cuadras: numeroPropiedad(intervencion.cuadras),
    metrosLineales:
      numeroPropiedad(intervencion.metrosLineales),
    metrosCuadrados:
      numeroPropiedad(intervencion.metrosCuadrados),
    fuente: valorPropiedad(intervencion.fuente),
    direccion: valorPropiedad(intervencion.direccion),
    latitud: numeroPropiedad(intervencion.latitud),
    longitud: numeroPropiedad(intervencion.longitud),
    geometriaTipo:
      valorPropiedad(intervencion.geometriaTipo),
    observaciones:
      valorPropiedad(intervencion.descripcion),
  }
}

function crearPropiedadesShp(intervencion, periodoActivo) {
  return {
    id: valorPropiedad(intervencion.id),
    periodo:
      valorPropiedad(intervencion.periodo) ||
      valorPropiedad(periodoActivo),
    nombre: valorPropiedad(intervencion.nombre),
    obra: valorPropiedad(intervencion.obra),
    barrio: valorPropiedad(intervencion.barrio),
    estado: valorPropiedad(intervencion.estado),
    inspect: valorPropiedad(intervencion.inspector),
    realizo: valorPropiedad(intervencion.realizo),
    cuadras: textoPropiedad(intervencion.cuadras),
    m_lineal:
      textoPropiedad(intervencion.metrosLineales),
    m2: textoPropiedad(intervencion.metrosCuadrados),
    fuente: valorPropiedad(intervencion.fuente),
    direccion: valorPropiedad(intervencion.direccion),
    obs: valorPropiedad(intervencion.descripcion),
    geom_tipo:
      valorPropiedad(intervencion.geometriaTipo),
  }
}

export function crearFeatureIntervencion(
  intervencion,
  periodoActivo,
  opciones = {}
) {
  const geometry =
    crearGeometriaGeoJSON(intervencion)

  if (!geometry) return null

  const properties = opciones.propiedadesShp
    ? crearPropiedadesShp(intervencion, periodoActivo)
    : crearPropiedadesCompletas(intervencion, periodoActivo)

  return {
    type: 'Feature',
    geometry,
    properties,
  }
}

export function crearFeatureCollectionIntervenciones(
  intervenciones = [],
  periodoActivo,
  opciones = {}
) {
  const features = intervenciones
    .map((intervencion) =>
      crearFeatureIntervencion(
        intervencion,
        periodoActivo,
        opciones
      )
    )
    .filter(Boolean)

  return {
    type: 'FeatureCollection',
    features,
  }
}

export function contarIntervencionesExportables(
  intervenciones = []
) {
  return intervenciones.filter((intervencion) =>
    Boolean(crearGeometriaGeoJSON(intervencion))
  ).length
}
