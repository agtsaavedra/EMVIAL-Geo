import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  calcularStatsPeriodo,
} = loadPureModule('src/services/periodoStats.js', [
  'calcularStatsPeriodo',
])

test('agrupa intervenciones por obra, barrio y geometria', () => {
  const stats = calcularStatsPeriodo([
    {
      obra: 'MICROBACHEO',
      barrio: 'CENTRO',
      geometriaTipo: 'Línea',
      cuadras: '2',
      metrosLineales: '180.5',
      geometria: [[-38, -57], [-38.001, -57]],
    },
    {
      obra: 'MICROBACHEO',
      barrio: 'CENTRO',
      geometriaTipo: 'Punto',
      latitud: '-38',
      longitud: '-57',
    },
  ])

  assert.equal(stats.total, 2)
  assert.equal(stats.conGeometria, 2)
  assert.equal(stats.cuadrasTotal, 2)
  assert.equal(stats.metrosLinealesTotal, 180.5)
  assert.deepEqual(stats.porBarrio[0], ['CENTRO', 2])
  assert.equal(stats.porObra[0].nombre, 'MICROBACHEO')
  assert.equal(stats.porObra[0].total, 2)
})
