const JSZip = require('jszip')

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`

function escapeXml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnaExcel(index) {
  let numero = index + 1
  let columna = ''

  while (numero > 0) {
    const resto = (numero - 1) % 26
    columna =
      String.fromCharCode(65 + resto) +
      columna
    numero = Math.floor((numero - 1) / 26)
  }

  return columna
}

function esNumeroExcel(valor) {
  return (
    typeof valor === 'number' &&
    Number.isFinite(valor)
  )
}

function crearCeldaXml(valor, fila, columna) {
  const referencia = `${columnaExcel(columna)}${fila}`

  if (esNumeroExcel(valor)) {
    return `<c r="${referencia}"><v>${valor}</v></c>`
  }

  return `<c r="${referencia}" t="inlineStr"><is><t>${escapeXml(valor)}</t></is></c>`
}

function obtenerColumnas(filas = []) {
  const columnas = []

  filas.forEach((fila) => {
    Object.keys(fila).forEach((key) => {
      if (!columnas.includes(key)) {
        columnas.push(key)
      }
    })
  })

  return columnas
}

function crearFilasXml(filas = []) {
  const columnas = obtenerColumnas(filas)
  const filasConEncabezado = [
    Object.fromEntries(
      columnas.map((columna) => [columna, columna])
    ),
    ...filas,
  ]

  return filasConEncabezado
    .map((fila, rowIndex) => {
      const numeroFila = rowIndex + 1
      const celdas = columnas
        .map((columna, columnIndex) =>
          crearCeldaXml(
            fila[columna],
            numeroFila,
            columnIndex
          )
        )
        .join('')

      return `<row r="${numeroFila}">${celdas}</row>`
    })
    .join('')
}

function crearHojaXml(filas = []) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${crearFilasXml(filas)}</sheetData>
</worksheet>`
}

function sanitizarNombreHoja(nombre) {
  const nombreLimpio = String(nombre || 'Hoja')
    .replace(/[\\/?*[\]:]/g, ' ')
    .trim()
    .slice(0, 31)

  return nombreLimpio || 'Hoja'
}

function crearWorkbookXml(hojas) {
  const sheets = hojas
    .map(
      (hoja, index) =>
        `<sheet name="${escapeXml(sanitizarNombreHoja(hoja.nombre))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets}</sheets>
</workbook>`
}

function crearWorkbookRelsXml(hojas) {
  const relaciones = hojas
    .map(
      (_hoja, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${relaciones}
<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
}

async function crearXlsxBlob(hojas = []) {
  const zip = new JSZip()

  zip.file('[Content_Types].xml', CONTENT_TYPES_XML)
  zip.file('_rels/.rels', ROOT_RELS_XML)
  zip.file('xl/workbook.xml', crearWorkbookXml(hojas))
  zip.file('xl/_rels/workbook.xml.rels', crearWorkbookRelsXml(hojas))
  zip.file('xl/styles.xml', STYLES_XML)

  hojas.forEach((hoja, index) => {
    zip.file(
      `xl/worksheets/sheet${index + 1}.xml`,
      crearHojaXml(hoja.filas)
    )
  })

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
  })
}

module.exports = {
  escapeXml,
  columnaExcel,
  crearHojaXml,
  sanitizarNombreHoja,
  crearXlsxBlob,
}
