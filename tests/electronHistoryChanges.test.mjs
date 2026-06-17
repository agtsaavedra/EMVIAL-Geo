import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  obtenerCambiosIntervencion,
  separarMetadataPersistencia,
} = require('../electron/db/historyChanges.js')

test('calcula diferencias entre intervenciones', () => {
  const cambios = obtenerCambiosIntervencion(
    {
      nombre: 'A',
      barrio: 'Centro',
      cuadras: '1',
    },
    {
      nombre: 'B',
      barrio: 'Centro',
      cuadras: '',
    }
  )

  assert.deepEqual(cambios, {
    nombre: {
      anterior: 'A',
      actual: 'B',
    },
    cuadras: {
      anterior: '1',
      actual: '',
    },
  })
})

test('devuelve el estado actual completo cuando no hay anterior', () => {
  const actual = {
    id: '1',
    nombre: 'Nueva',
  }

  assert.deepEqual(
    obtenerCambiosIntervencion(null, actual),
    actual
  )
})

test('separa metadata de historial antes de persistir', () => {
  const resultado = separarMetadataPersistencia({
    id: '1',
    nombre: 'Copia',
    __historialAccion: 'duplicar',
    __historialOrigenId: '0',
  })

  assert.deepEqual(resultado, {
    datosPersistibles: {
      id: '1',
      nombre: 'Copia',
    },
    metadata: {
      historialAccion: 'duplicar',
      historialOrigenId: '0',
    },
  })
})
