import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  calcularLongitudLineaMetros,
  calcularAreaPoligonoMetrosCuadrados,
  formatearMetrosFormulario,
} = loadPureModule('src/services/geometryMetrics.js', [
  'calcularLongitudLineaMetros',
  'calcularAreaPoligonoMetrosCuadrados',
  'formatearMetrosFormulario',
])

test('calcula longitud aproximada de una linea urbana', () => {
  const metros = calcularLongitudLineaMetros([
    [-38, -57],
    [-38.001, -57],
  ])

  assert.ok(metros > 110)
  assert.ok(metros < 112)
})

test('calcula area positiva para un poligono valido', () => {
  const area = calcularAreaPoligonoMetrosCuadrados([
    [-38, -57],
    [-38, -57.001],
    [-38.001, -57.001],
    [-38.001, -57],
  ])

  assert.ok(area > 9500)
  assert.ok(area < 10000)
})

test('no formatea metricas nulas o negativas', () => {
  assert.equal(formatearMetrosFormulario(0), '')
  assert.equal(formatearMetrosFormulario(-1), '')
  assert.equal(formatearMetrosFormulario(12.345), '12.35')
})
