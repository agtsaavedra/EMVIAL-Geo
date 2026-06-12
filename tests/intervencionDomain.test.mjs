import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  obtenerMetricasIntervencion,
  obtenerSubtituloIntervencion,
  obtenerReferenciaIntervencion,
} = loadPureModule('src/domain/intervencion.js', [
  'obtenerMetricasIntervencion',
  'obtenerSubtituloIntervencion',
  'obtenerReferenciaIntervencion',
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
