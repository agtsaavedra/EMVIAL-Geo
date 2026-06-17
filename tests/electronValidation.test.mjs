import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  validarArchivoDatos,
  validarIntervencion,
  validarIntervencionesMasivo,
  validarPeriodo,
} = require('../electron/validation.js')

test('normaliza periodo y rechaza meses invalidos', () => {
  assert.equal(validarPeriodo('2026-06'), '2026-06')
  assert.throws(
    () => validarPeriodo('2026-13'),
    /Periodo invalido/
  )
})

test('rechaza rutas fuera de los datos permitidos', () => {
  assert.equal(
    validarArchivoDatos('barrios.geojson'),
    'barrios.geojson'
  )

  assert.throws(
    () => validarArchivoDatos('../barrios.geojson'),
    /Archivo de datos no permitido/
  )
})

test('normaliza una linea valida y fuerza estado finalizada', () => {
  const intervencion = validarIntervencion({
    id: '  abc  ',
    estado: 'Pendiente',
    geometriaTipo: 'Linea',
    geometria: [
      ['-38.1', '-57.5'],
      ['-38.2', '-57.6'],
    ],
    periodo: '2026-06',
    nombre: '  Calle 1  ',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
    version: '3',
    __focusKey: 'no debe persistir',
  })

  assert.equal(intervencion.id, 'abc')
  assert.equal(intervencion.estado, 'Finalizada')
  assert.equal(intervencion.geometriaTipo, 'Línea')
  assert.equal(intervencion.nombre, 'Calle 1')
  assert.deepEqual(intervencion.geometria, [
    [-38.1, -57.5],
    [-38.2, -57.6],
  ])
  assert.equal('__focusKey' in intervencion, false)
})

test('crea geometria de punto desde latitud y longitud', () => {
  const intervencion = validarIntervencion({
    geometriaTipo: 'Punto',
    latitud: '-38,01',
    longitud: '-57,55',
  })

  assert.deepEqual(intervencion.geometria, [
    [-38.01, -57.55],
  ])
})

test('rechaza geometria insuficiente para linea y poligono', () => {
  assert.throws(
    () =>
      validarIntervencion({
        geometriaTipo: 'Linea',
        geometria: [[-38, -57]],
      }),
    /linea debe tener al menos dos puntos/
  )

  assert.throws(
    () =>
      validarIntervencion({
        geometriaTipo: 'Poligono',
        geometria: [
          [-38, -57],
          [-38.1, -57.1],
        ],
      }),
    /poligono debe tener al menos tres puntos/
  )
})

test('valida importaciones masivas con limite razonable', () => {
  assert.throws(
    () => validarIntervencionesMasivo({}),
    /Lista de intervenciones invalida/
  )

  assert.throws(
    () => validarIntervencionesMasivo(new Array(5001).fill({})),
    /Demasiadas intervenciones/
  )
})
