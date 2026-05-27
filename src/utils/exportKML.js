function escapeXml(value) {
  if (value === null || value === undefined) return ''

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function obtenerColorKml(intervencion) {
  const obra = `${intervencion.obra || ''}`.toUpperCase()

  // formato KML: aabbggrr

  if (obra.includes('MICROBACHEO')) return 'ff2d2dff' // rojo google-ish
  if (obra.includes('BACHEO')) return 'ff5e412f' // marrón
  if (obra.includes('TJ')) return 'ffff4de3' // violeta fuerte
  if (obra.includes('GRANZA')) return 'ff4caf50' // verde
  if (obra.includes('PAVIMENT')) return 'fff4b400' // amarillo/naranja
  if (obra.includes('RECAPADO')) return 'fffb8c00' // naranja
  if (obra.includes('CORDON') || obra.includes('CORDÓN'))
    return 'ff00bcd4' // celeste
  if (obra.includes('LED') || obra.includes('ALUMBRADO'))
    return 'ff00ffff' // cyan

  return 'ff9c27b0'
}

function obtenerNombre(intervencion) {
  const obra = intervencion.obra || 'Intervención'

  if (intervencion.nombre?.trim()) {
    return `${obra} · ${intervencion.nombre}`
  }

  if (intervencion.ubicacion?.trim()) {
    return `${obra} · ${intervencion.ubicacion}`
  }

  return obra
}

function crearDescripcion(intervencion) {
  return `
<![CDATA[
<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5">

<h3 style="margin-bottom:10px;">
${escapeXml(intervencion.obra || 'Intervención')}
</h3>

<table style="border-collapse:collapse">

<tr>
<td><strong>Nombre</strong></td>
<td>${escapeXml(intervencion.nombre)}</td>
</tr>

<tr>
<td><strong>Ubicación</strong></td>
<td>${escapeXml(intervencion.ubicacion)}</td>
</tr>

<tr>
<td><strong>Barrio</strong></td>
<td>${escapeXml(intervencion.barrio)}</td>
</tr>

<tr>
<td><strong>Estado</strong></td>
<td>${escapeXml(intervencion.estado)}</td>
</tr>

<tr>
<td><strong>Mes terminación</strong></td>
<td>${escapeXml(intervencion.mesTerminacion)}</td>
</tr>

<tr>
<td><strong>Cuadras</strong></td>
<td>${escapeXml(intervencion.cuadras)}</td>
</tr>

<tr>
<td><strong>Metros lineales</strong></td>
<td>${escapeXml(intervencion.metrosLineales)}</td>
</tr>

<tr>
<td><strong>M²</strong></td>
<td>${escapeXml(intervencion.metrosCuadrados)}</td>
</tr>

<tr>
<td><strong>Inspector</strong></td>
<td>${escapeXml(intervencion.inspector)}</td>
</tr>

<tr>
<td><strong>Realizó</strong></td>
<td>${escapeXml(intervencion.realizo)}</td>
</tr>

<tr>
<td><strong>Fuente</strong></td>
<td>${escapeXml(intervencion.fuente)}</td>
</tr>

</table>

${
  intervencion.descripcion
    ? `
<hr/>
<p>
<strong>Observaciones:</strong><br/>
${escapeXml(intervencion.descripcion)}
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

function placemarkKml(intervencion) {
  const styleId = `style-${intervencion.id}`
  const color = obtenerColorKml(intervencion)

  let geometry = ''

  if (
    intervencion.geometriaTipo === 'Línea' &&
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
    intervencion.geometriaTipo === 'Polígono' &&
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
  } else if (intervencion.latitud && intervencion.longitud) {
    geometry = `
<Point>
<coordinates>
${intervencion.longitud},${intervencion.latitud},0
</coordinates>
</Point>
`
  }

  if (!geometry) return ''

  return `
<Style id="${styleId}">
<LineStyle>
<color>${color}</color>
<width>6</width>
</LineStyle>

<PolyStyle>
<color>55${color.slice(2)}</color>
</PolyStyle>
</Style>

<Placemark>
<name>${escapeXml(obtenerNombre(intervencion))}</name>
<styleUrl>#${styleId}</styleUrl>
<description>
${crearDescripcion(intervencion)}
</description>
${geometry}
</Placemark>
`
}

export function exportarKml(intervenciones) {
  const contenido = intervenciones.map(placemarkKml).join('\n')

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
}