import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  columnaExcel,
  crearHojaXml,
  escapeXml,
  sanitizarNombreHoja,
} = require('../src/services/xlsxWriter.cjs')

test('escapa XML para valores de celdas', () => {
  assert.equal(
    escapeXml('A&B <test> "ok"'),
    'A&amp;B &lt;test&gt; &quot;ok&quot;'
  )
})

test('convierte indices a columnas Excel', () => {
  assert.equal(columnaExcel(0), 'A')
  assert.equal(columnaExcel(25), 'Z')
  assert.equal(columnaExcel(26), 'AA')
  assert.equal(columnaExcel(27), 'AB')
})

test('crea XML de hoja con encabezados y valores', () => {
  const xml = crearHojaXml([
    {
      Nombre: 'Linea',
      Total: 2,
    },
  ])

  assert.match(xml, /<worksheet/)
  assert.match(xml, /<c r="A1" t="inlineStr">/)
  assert.match(xml, /<t>Nombre<\/t>/)
  assert.match(xml, /<c r="B2"><v>2<\/v><\/c>/)
})

test('sanitiza nombres de hojas para Excel', () => {
  assert.equal(
    sanitizarNombreHoja('Resumen/Periodo:*?[]'),
    'Resumen Periodo'
  )
  assert.equal(
    sanitizarNombreHoja('x'.repeat(40)).length,
    31
  )
})
