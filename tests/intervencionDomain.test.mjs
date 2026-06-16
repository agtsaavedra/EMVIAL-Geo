import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  obtenerMetricasIntervencion,
  obtenerSubtituloIntervencion,
  obtenerReferenciaIntervencion,
  normalizarIntervencion,
  normalizarGeometriaTipo,
} = loadPureModule('src/domain/intervencion.js', [
  'obtenerMetricasIntervencion',
  'obtenerSubtituloIntervencion',
  'obtenerReferenciaIntervencion',
  'normalizarIntervencion',
  'normalizarGeometriaTipo',
])

test('no muestra metricas para puntos', () => {
  const metricas = obtenerMetricasIntervencion({
    geometriaTipo: 'Punto',
    metrosLineales: '10',
    metrosCuadrados: '5',
  })

  assert.deepEqual(metricas, [])
})

test('resume titulo secundario y referencia', () => {
  const intervencion = {
    nombre: 'Linea secundaria',
    obra: 'MICROBACHEO',
    geometriaTipo: 'Línea',
    ubicacion: 'ARENales 2300',
    direccion: 'Direccion larga',
  }

  assert.equal(
    obtenerSubtituloIntervencion(intervencion),
    'MICROBACHEO / Línea'
  )
  assert.equal(
    obtenerReferenciaIntervencion(intervencion),
    'ARENales 2300'
  )
})

test('normaliza tipos externos al valor canonico de la app', () => {
  assert.equal(normalizarGeometriaTipo('Linea'), 'Línea')
  assert.equal(normalizarGeometriaTipo('Línea'), 'Línea')
  assert.equal(normalizarGeometriaTipo('Poligono'), 'Polígono')
  assert.equal(normalizarGeometriaTipo('Polígono'), 'Polígono')
  assert.equal(normalizarGeometriaTipo('Punto'), 'Punto')
})

test('calcula metricas aunque la geometria venga sin tilde', () => {
  const metricas = obtenerMetricasIntervencion({
    geometriaTipo: 'Linea',
    metrosLineales: '120.5',
    cuadras: '1.5',
  })

  assert.deepEqual(metricas, [
    {
      label: 'm lineales',
      value: '120,5',
    },
    {
      label: 'cuadras',
      value: '1,5',
    },
  ])
})

test('normaliza el contrato base de intervencion', () => {
  const intervencion = normalizarIntervencion(
    {
      id: 123,
      nombre: '  Prueba  ',
      geometriaTipo: '',
      geometria: [
        ['-38.1', '-57.2'],
        ['x', '-57.3'],
      ],
      version: '0',
    },
    {
      ahora: '2026-06-12T00:00:00.000Z',
    }
  )

  assert.equal(intervencion.id, '123')
  assert.equal(intervencion.nombre, 'Prueba')
  assert.equal(intervencion.estado, 'Finalizada')
  assert.equal(intervencion.geometriaTipo, 'Punto')
  assert.deepEqual(intervencion.geometria, [
    [-38.1, -57.2],
  ])
  assert.equal(intervencion.version, 1)
  assert.equal(intervencion.syncStatus, 'synced')
  assert.equal(
    intervencion.createdAt,
    '2026-06-12T00:00:00.000Z'
  )
})
