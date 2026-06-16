/**
 * Contrato unico para exportar intervenciones.
 *
 * Mantiene fuera de los archivos publicos los campos internos de persistencia,
 * sincronizacion e historial, y da una salida estable para Excel, GeoJSON,
 * SHP y KML.
 */

const SIN_PERIODO = 'sin_periodo'

function quitarDiacriticos(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function valorTexto(valor) {
  if (valor === null || valor === undefined) {
    return ''
  }

  return String(valor)
}

function valorNumero(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return null
  }

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

function valorExcel(valor) {
  return valor ?? ''
}

export function normalizarTipoGeometria(tipo) {
  const limpio = quitarDiacriticos(tipo)
    .trim()
    .toUpperCase()

  if (
    limpio === 'LINEA' ||
    /^L.+NEA$/.test(limpio)
  ) {
    return 'Linea'
  }

  if (
    limpio === 'POLIGONO' ||
    /^POL.+GONO$/.test(limpio)
  ) {
    return 'Poligono'
  }

  return 'Punto'
}

export function contarPuntosIntervencion(intervencion = {}) {
  return Array.isArray(intervencion.geometria)
    ? intervencion.geometria.length
    : 0
}

export function formatearGeometriaIntervencion(intervencion = {}) {
  if (
    !Array.isArray(intervencion.geometria) ||
    intervencion.geometria.length === 0
  ) {
    return ''
  }

  return JSON.stringify(intervencion.geometria)
}

export function crearIntervencionExportDTO(
  intervencion = {},
  periodoActivo = ''
) {
  return {
    id: valorTexto(intervencion.id),
    periodo:
      valorTexto(intervencion.periodo) ||
      valorTexto(periodoActivo) ||
      SIN_PERIODO,
    nombre: valorTexto(intervencion.nombre),
    mesTerminacion: valorTexto(intervencion.mesTerminacion),
    obra: valorTexto(intervencion.obra),
    ubicacion: valorTexto(intervencion.ubicacion),
    barrio: valorTexto(intervencion.barrio),
    estado: valorTexto(intervencion.estado),
    inspector: valorTexto(intervencion.inspector),
    realizo: valorTexto(intervencion.realizo),
    cuadras: valorNumero(intervencion.cuadras),
    metrosLineales: valorNumero(intervencion.metrosLineales),
    metrosCuadrados: valorNumero(intervencion.metrosCuadrados),
    fuente: valorTexto(intervencion.fuente),
    direccion: valorTexto(intervencion.direccion),
    latitud: valorNumero(intervencion.latitud),
    longitud: valorNumero(intervencion.longitud),
    geometriaTipo: normalizarTipoGeometria(
      intervencion.geometriaTipo
    ),
    puntos: contarPuntosIntervencion(intervencion),
    observaciones: valorTexto(intervencion.descripcion),
    geometria: formatearGeometriaIntervencion(intervencion),
  }
}

export function crearPropiedadesGeoJSON(
  intervencion = {},
  periodoActivo = ''
) {
  const dto = crearIntervencionExportDTO(
    intervencion,
    periodoActivo
  )

  return {
    id: dto.id,
    periodo: dto.periodo,
    nombre: dto.nombre,
    mesTerminacion: dto.mesTerminacion,
    obra: dto.obra,
    ubicacion: dto.ubicacion,
    barrio: dto.barrio,
    estado: dto.estado,
    inspector: dto.inspector,
    realizo: dto.realizo,
    cuadras: dto.cuadras,
    metrosLineales: dto.metrosLineales,
    metrosCuadrados: dto.metrosCuadrados,
    fuente: dto.fuente,
    direccion: dto.direccion,
    latitud: dto.latitud,
    longitud: dto.longitud,
    geometriaTipo: dto.geometriaTipo,
    puntos: dto.puntos,
    observaciones: dto.observaciones,
  }
}

export function crearPropiedadesShp(
  intervencion = {},
  periodoActivo = ''
) {
  const dto = crearIntervencionExportDTO(
    intervencion,
    periodoActivo
  )

  return {
    id: dto.id,
    periodo: dto.periodo,
    nombre: dto.nombre,
    mes_term: dto.mesTerminacion,
    obra: dto.obra,
    ubicacion: dto.ubicacion,
    barrio: dto.barrio,
    estado: dto.estado,
    inspect: dto.inspector,
    realizo: dto.realizo,
    cuadras: valorTexto(dto.cuadras),
    m_lineal: valorTexto(dto.metrosLineales),
    m2: valorTexto(dto.metrosCuadrados),
    fuente: dto.fuente,
    direccion: dto.direccion,
    latitud: valorTexto(dto.latitud),
    longitud: valorTexto(dto.longitud),
    geom_tipo: dto.geometriaTipo,
    puntos: valorTexto(dto.puntos),
    obs: dto.observaciones,
  }
}

export function crearFilaExcelIntervencion(
  intervencion = {},
  periodoActivo = ''
) {
  const dto = crearIntervencionExportDTO(
    intervencion,
    periodoActivo
  )

  return {
    Periodo: valorExcel(dto.periodo),
    Nombre: valorExcel(dto.nombre),
    'Mes de terminacion': valorExcel(dto.mesTerminacion),
    Obra: valorExcel(dto.obra),
    Ubicacion: valorExcel(dto.ubicacion),
    Barrio: valorExcel(dto.barrio),
    Estado: valorExcel(dto.estado),
    Inspector: valorExcel(dto.inspector),
    Realizo: valorExcel(dto.realizo),
    Cuadras: valorExcel(dto.cuadras),
    'Metros lineales': valorExcel(dto.metrosLineales),
    'Metros cuadrados': valorExcel(dto.metrosCuadrados),
    Fuente: valorExcel(dto.fuente),
    Direccion: valorExcel(dto.direccion),
    Latitud: valorExcel(dto.latitud),
    Longitud: valorExcel(dto.longitud),
    'Tipo de geometria': valorExcel(dto.geometriaTipo),
    'Cantidad de puntos': valorExcel(dto.puntos),
    Observaciones: valorExcel(dto.observaciones),
    Geometria: valorExcel(dto.geometria),
  }
}
