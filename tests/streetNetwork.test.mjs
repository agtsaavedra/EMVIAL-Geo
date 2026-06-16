import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  calcularCuadrasPorInterferencias,
} = loadPureModule(
  'src/services/streetNetwork/cuadras.js',
  ['calcularCuadrasPorInterferencias']
)

test('calcula cuadras por espacios entre interferencias', () => {
  assert.equal(
    calcularCuadrasPorInterferencias({
      interferencias: [
        'BUENOS AIRES',
        'ENTRE RIOS',
        'CORRIENTES',
        'SANTA FE',
        'SANTIAGO DEL ESTERO',
      ],
      fallback: 0,
    }),
    '4'
  )

  assert.equal(
    calcularCuadrasPorInterferencias({
      interferencias: [],
      fallback: 3,
    }),
    '3'
  )
})

test('cuenta tramos completos cuando una linea cruza cuatro cuadras', () => {
  assert.equal(
    calcularCuadrasPorInterferencias({
      interferencias: [
        'BUENOS AIRES',
        'ARENALES',
        'LAMADRID',
        'LAS HERAS',
        'SARMIENTO',
      ],
      fallback: 4,
    }),
    '4'
  )
})

test('mantiene una cuadra operativa con una sola interferencia detectada', () => {
  assert.equal(
    calcularCuadrasPorInterferencias({
      interferencias: ['PLAZA MITRE'],
      fallback: 0,
    }),
    '1'
  )
})

test('usa fallback cuando la red vial no aporta interferencias', () => {
  assert.equal(
    calcularCuadrasPorInterferencias({
      interferencias: [],
      fallback: 1.5,
    }),
    '1.5'
  )
})
