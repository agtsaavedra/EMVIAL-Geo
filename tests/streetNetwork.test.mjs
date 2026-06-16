import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  calcularCuadrasPorInterferencias,
  crearAdvertenciaLineaMulticalle,
  normalizarCallesUnicas,
} = loadPureModule(
  'src/services/streetNetwork/cuadras.js',
  [
    'calcularCuadrasPorInterferencias',
    'crearAdvertenciaLineaMulticalle',
    'normalizarCallesUnicas',
  ]
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

test('normaliza interferencias duplicadas de una traza real', () => {
  assert.deepEqual(
    normalizarCallesUnicas([
      ' BUENOS AIRES ',
      'ARENALES',
      'BUENOS AIRES',
      '',
      null,
      'LAMADRID',
    ]),
    [
      'BUENOS AIRES',
      'ARENALES',
      'LAMADRID',
    ]
  )

  assert.equal(
    calcularCuadrasPorInterferencias({
      interferencias: [
        'BUENOS AIRES',
        'ARENALES',
        'ARENALES',
        'LAMADRID',
      ],
      fallback: 4,
    }),
    '2'
  )
})

test('no advierte cuando todos los segmentos pertenecen a la misma calle', () => {
  assert.equal(
    crearAdvertenciaLineaMulticalle([
      'AV COLON',
      'AV COLON',
      ' AV COLON ',
    ]),
    null
  )
})

test('advierte cuando una linea dobla y recorre otra calle', () => {
  assert.deepEqual(
    crearAdvertenciaLineaMulticalle([
      'AV COLON',
      'AV COLON',
      'BUENOS AIRES',
    ]),
    {
      tipo: 'linea-multicalle',
      mensaje:
        'La linea dibujada recorre mas de una calle (AV COLON, BUENOS AIRES). Para mantener datos consistentes, cargue cada calle como una intervencion separada.',
      calles: ['AV COLON', 'BUENOS AIRES'],
    }
  )
})
