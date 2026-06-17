import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  crearIntervencionesRepository,
} = require('../electron/db/intervencionesRepository.js')

class SelectByIdStatement {
  constructor(rows) {
    this.rows = rows
    this.id = null
    this.hasStepped = false
  }

  bind([id]) {
    this.id = id
  }

  step() {
    this.hasStepped = true
    return this.rows.has(this.id)
  }

  get() {
    return [
      JSON.stringify(this.rows.get(this.id).data),
    ]
  }

  free() {}
}

class FakeIntervencionesDB {
  constructor() {
    this.rows = new Map()
    this.operations = []
  }

  exec() {
    return [
      {
        values: Array.from(this.rows.values())
          .map((row) => [JSON.stringify(row.data)]),
      },
    ]
  }

  prepare() {
    return new SelectByIdStatement(this.rows)
  }

  run(sql, args = []) {
    const normalized = sql.trim()
    this.operations.push(normalized.split(/\s+/).join(' '))

    if (normalized.startsWith('BEGIN') || normalized.startsWith('COMMIT')) {
      return
    }

    if (normalized.startsWith('ROLLBACK')) {
      return
    }

    if (normalized.startsWith('UPDATE intervenciones')) {
      const [data, updatedAt, id] = args
      const actual = this.rows.get(id)

      this.rows.set(id, {
        ...actual,
        data: JSON.parse(data),
        updatedAt,
      })

      return
    }

    if (normalized.startsWith('INSERT INTO intervenciones')) {
      const [id, data, createdAt, updatedAt] = args

      this.rows.set(id, {
        id,
        data: JSON.parse(data),
        createdAt,
        updatedAt,
      })

      return
    }

    if (normalized.startsWith('DELETE FROM intervenciones')) {
      this.rows.delete(args[0])
    }
  }
}

function crearRepositoryFixture() {
  const db = new FakeIntervencionesDB()
  const historial = []
  const backups = []
  let guardados = 0
  let id = 100

  const repository = crearIntervencionesRepository({
    asegurarDB: async () => db,
    guardarArchivo: async () => {
      guardados += 1
    },
    marcarBackupPendiente: (periodo) => {
      backups.push(periodo)
    },
    registrarHistorialCambio: (cambio) => {
      historial.push(cambio)
    },
    crearId: () => {
      id += 1
      return id
    },
    obtenerFecha: () => '2026-06-17T12:00:00.000Z',
  })

  return {
    db,
    historial,
    backups,
    get guardados() {
      return guardados
    },
    repository,
  }
}

test('guarda intervenciones nuevas y remueve metadata interna', async () => {
  const fixture = crearRepositoryFixture()

  const guardada = await fixture.repository.guardarIntervencion({
    nombre: 'Copia',
    periodo: '2026-06',
    __historialAccion: 'duplicar',
    __historialOrigenId: 'original-1',
  })

  assert.equal(guardada.id, '101')
  assert.equal(guardada.__historialAccion, undefined)
  assert.equal(fixture.db.rows.get('101').data.__historialOrigenId, undefined)
  assert.equal(fixture.historial[0].accion, 'duplicar')
  assert.equal(fixture.historial[0].actual.duplicadaDe, 'original-1')
  assert.deepEqual(fixture.backups, ['2026-06'])
  assert.equal(fixture.guardados, 1)
})

test('actualiza intervenciones existentes con historial de edicion', async () => {
  const fixture = crearRepositoryFixture()

  await fixture.repository.guardarIntervencion({
    id: '1',
    nombre: 'Original',
    periodo: '2026-06',
  })
  await fixture.repository.guardarIntervencion({
    id: '1',
    nombre: 'Editada',
    periodo: '2026-07',
  })

  assert.equal(fixture.db.rows.get('1').data.nombre, 'Editada')
  assert.equal(fixture.historial[1].accion, 'editar')
  assert.equal(fixture.historial[1].anterior.nombre, 'Original')
  assert.deepEqual(fixture.backups, ['2026-06', '2026-07'])
})

test('elimina intervenciones y conserva el periodo para backup pendiente', async () => {
  const fixture = crearRepositoryFixture()

  await fixture.repository.guardarIntervencion({
    id: '1',
    nombre: 'A borrar',
    periodo: '2026-06',
  })
  const ok = await fixture.repository.eliminarIntervencion('1')

  assert.equal(ok, true)
  assert.equal(fixture.db.rows.has('1'), false)
  assert.equal(fixture.historial.at(-1).accion, 'eliminar')
  assert.deepEqual(fixture.backups, ['2026-06', '2026-06'])
})

test('guarda intervenciones masivas dentro de una transaccion', async () => {
  const fixture = crearRepositoryFixture()

  const guardadas =
    await fixture.repository.guardarIntervencionesMasivo([
      {
        id: '1',
        nombre: 'Uno',
        periodo: '2026-06',
      },
      {
        nombre: 'Dos',
        periodo: '2026-07',
      },
    ])

  assert.equal(guardadas.length, 2)
  assert.equal(fixture.db.rows.size, 2)
  assert.equal(fixture.db.operations.includes('BEGIN TRANSACTION'), true)
  assert.equal(fixture.db.operations.includes('COMMIT'), true)
  assert.equal(fixture.guardados, 1)
})
