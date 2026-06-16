/**
 * Servicio de exportacion KML.
 *
 * Convierte intervenciones cargadas en EMVIAL Geo a un archivo KML compatible
 * con Google Earth, Google My Maps y otros visores GIS basicos.
 */

import {
  crearIntervencionExportDTO,
  normalizarTipoGeometria,
} from '@services/exportIntervencionDTO'

function escapeXml(value) {
  if (value === null || value === undefined) return ''

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function normalizarTexto(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

// KML usa formato aabbggrr, distinto al hexadecimal CSS habitual.
function obtenerColorKml(intervencion) {
  const obra = normalizarTexto(intervencion.obra)

  if (obra.includes('MICROBACHEO')) return 'ff2d2dff'
  if (obra.includes('BACHEO')) return 'ff5e412f'
  if (obra.includes('TJ')) return 'ffff4de3'
  if (obra.includes('GRANZA')) return 'ff4caf50'
  if (obra.includes('PAVIMENT')) return 'fff4b400'
  if (obra.includes('RECAPADO')) return 'fffb8c00'
  if (obra.includes('CORDON')) return 'ff00bcd4'
  if (obra.includes('LED') || obra.includes('ALUMBRADO')) return 'ff00ffff'

  return 'ff9c27b0'
}

function obtenerNombre(dto) {
  const obra = dto.obra || 'Intervencion'

  if (dto.nombre.trim()) {
    return `${obra} - ${dto.nombre}`
  }

  if (dto.ubicacion.trim()) {
    return `${obra} - ${dto.ubicacion}`
  }

  return obra
}

function filaDescripcion(label, value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return ''
  }

  return `
<tr>
  <td><strong>${escapeXml(label)}</strong></td>
  <td>${escapeXml(value)}</td>
</tr>
`
}

function crearDescripcion(dto) {
  return `
<![CDATA[
<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5">
<h3 style="margin-bottom:10px;">
${escapeXml(dto.obra || 'Intervencion')}
</h3>

<table style="border-collapse:collapse">
${filaDescripcion('Nombre', dto.nombre)}
${filaDescripcion('Ubicacion', dto.ubicacion)}
${filaDescripcion('Barrio', dto.barrio)}
${filaDescripcion('Mes terminacion', dto.mesTerminacion)}
${filaDescripcion('Geometria', dto.geometriaTipo)}
${filaDescripcion('Cuadras', dto.cuadras)}
${filaDescripcion('Metros lineales', dto.metrosLineales)}
${filaDescripcion('Metros cuadrados', dto.metrosCuadrados)}
${filaDescripcion('Inspector', dto.inspector)}
${filaDescripcion('Realizo', dto.realizo)}
${filaDescripcion('Fuente', dto.fuente)}
</table>

${
  dto.observaciones
    ? `
<hr/>
<p>
<strong>Observaciones:</strong><br/>
${escapeXml(dto.observaciones)}
</p>
`
    : ''
}
</div>
]]>
`
}

function coordenadasKml(geometria) {
  return geometria
    .map(([lat, lon]) => `${lon},${lat},0`)
    .join(' ')
}

function placemarkKml(intervencion, index) {
  const dto =
    crearIntervencionExportDTO(intervencion)
  const styleId = `style-${dto.id || index}`
  const color = obtenerColorKml(dto)
  const tipo = normalizarTipoGeometria(
    intervencion.geometriaTipo
  )

  let geometry = ''

  if (
    tipo === 'Linea' &&
    intervencion.geometria?.length > 1
  ) {
    geometry = `
<LineString>
<tessellate>1</tessellate>
<coordinates>
${coordenadasKml(intervencion.geometria)}
</coordinates>
</LineString>
`
  } else if (
    tipo === 'Poligono' &&
    intervencion.geometria?.length > 2
  ) {
    const coords = coordenadasKml([
      ...intervencion.geometria,
      intervencion.geometria[0],
    ])

    geometry = `
<Polygon>
<outerBoundaryIs>
<LinearRing>
<coordinates>
${coords}
</coordinates>
</LinearRing>
</outerBoundaryIs>
</Polygon>
`
  } else if (
    dto.latitud !== null &&
    dto.longitud !== null
  ) {
    geometry = `
<Point>
<coordinates>
${dto.longitud},${dto.latitud},0
</coordinates>
</Point>
`
  }

  if (!geometry) return ''

  return `
<Style id="${escapeXml(styleId)}">
<LineStyle>
<color>${color}</color>
<width>6</width>
</LineStyle>

<PolyStyle>
<color>55${color.slice(2)}</color>
</PolyStyle>
</Style>

<Placemark>
<name>${escapeXml(obtenerNombre(dto))}</name>
<styleUrl>#${escapeXml(styleId)}</styleUrl>
<description>
${crearDescripcion(dto)}
</description>
${geometry}
</Placemark>
`
}

/**
 * Genera y descarga un archivo KML con las intervenciones recibidas.
 *
 * Devuelve true si exporto al menos una geometria valida y false si no habia
 * datos.
 */
export function exportarKml(intervenciones = []) {
  if (!intervenciones.length) {
    return false
  }

  const contenido = intervenciones
    .map((intervencion, index) =>
      placemarkKml(intervencion, index)
    )
    .filter(Boolean)
    .join('\n')

  if (!contenido.trim()) {
    return false
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>

<name>EMVIAL Geo</name>

${contenido}

</Document>
</kml>`

  const blob = new Blob([kml], {
    type: 'application/vnd.google-earth.kml+xml;charset=utf-8',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fecha = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `EMVIAL_Geo_${fecha}.kml`
  link.click()

  URL.revokeObjectURL(url)

  return true
}
