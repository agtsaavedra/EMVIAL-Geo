import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  crearHistorialRepository,
} = require('../electron/db/historialRepository.js')

class FakeHistorialStatement {
  constructor(rows) {
    this.rows = rows
    this.index = -1
    this.boundId = null
    this.freed = false
  }

  bind([id]) {
    this.boundId = id
  }

  step() {
    this.index += 1
    return this.index < this.rows.length
  }

  getAsObject() {
    return this.rows[this.index]
  }

  free() {
    this.freed = true
  }
}

test('registra cambios de historial con diferencias calculadas', () => {
  const inserts = []
  const repository = crearHistorialRepository({
    obtenerDB: () => ({
      run: (sql, args) => {
        inserts.push({
          sql,
          args,
        })
      },
    }),
    crearId: () => 'hist-1',
    obtenerFecha: () => '2026-06-17T12:00:00.000Z',
  })

  repository.registrarHistorialCambio({
    intervencionId: '1',
    accion: 'editar',
    anterior: {
      nombre: 'Antes',
    },
    actual: {
      nombre: 'Despues',
    },
  })

  assert.equal(inserts.length, 1)
  assert.deepEqual(inserts[0].args.slice(0, 3), [
    'hist-1',
    '1',
    'editar',
  ])
  assert.deepEqual(JSON.parse(inserts[0].args[3]), {
    nombre: {
      anterior: 'Antes',
      actual: 'Despues',
    },
  })
})

test('lee historial y parsea los cambios JSON', () => {
  const stmt = new FakeHistorialStatement([
    {
      id: 'h1',
      intervencionId: '1',
      accion: 'crear',
      cambios: '{"nombre":"Nueva"}',
      fecha: '2026-06-17T12:00:00.000Z',
    },
  ])
  const repository = crearHistorialRepository({
    obtenerDB: () => ({
      prepare: () => stmt,
    }),
  })

  const historial =
    repository.obtenerHistorialIntervencion('1')

  assert.deepEqual(historial, [
    {
      id: 'h1',
      intervencionId: '1',
      accion: 'crear',
      cambios: {
        nombre: 'Nueva',
      },
      fecha: '2026-06-17T12:00:00.000Z',
    },
  ])
  assert.equal(stmt.boundId, '1')
  assert.equal(stmt.freed, true)
})
