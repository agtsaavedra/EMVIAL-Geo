import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  analizarCalidadIntervenciones,
} = loadPureModule('src/services/dataQuality.js', [
  'analizarCalidadIntervenciones',
])

test('detecta intervenciones incompletas', () => {
  const resultado = analizarCalidadIntervenciones([
    {
      id: '1',
      obra: 'PAVIMENTACION',
      geometriaTipo: 'Punto',
      barrio: '',
      ubicacion: '',
      direccion: '',
      latitud: '',
      longitud: '',
    },
  ])

  assert.equal(resultado.totalIntervenciones, 1)
  assert.equal(resultado.altas, 1)
  assert.equal(resultado.medias, 2)
  assert.equal(resultado.totalIssues, 3)
})
