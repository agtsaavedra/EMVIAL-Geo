import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  crearDuplicadoIntervencion,
} = loadPureModule(
  'src/domain/duplicarIntervencion.js',
  ['crearDuplicadoIntervencion']
)

test('crea una copia operativa sin campos tecnicos heredados', () => {
  const original = {
    id: 'original-1',
    nombre: 'Linea principal',
    mesTerminacion: '2026-06',
    obra: 'MICROBACHEO',
    ubicacion: 'AV COLON 2100/2300',
    barrio: 'CENTRO',
    estado: 'Pendiente',
    fuente: 'Carga manual',
    inspector: 'GM',
    realizo: 'Equipo A',
    cuadras: '2',
    metrosLineales: '180.5',
    metrosCuadrados: '',
    descripcion: 'Observacion',
    direccion: 'Av Colon 2200',
    latitud: '-38.010000',
    longitud: '-57.550000',
    geometriaTipo: 'Línea',
    geometria: [
      [-38.01, -57.55],
      [-38.02, -57.56],
    ],
    periodo: '2026-06',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
    deletedAt: '2026-01-03',
    version: 9,
    syncStatus: 'pending',
    updatedBy: 'usuario-a',
    __focusKey: 'focus',
  }

  const duplicada = crearDuplicadoIntervencion(
    original,
    {
      id: 'duplicada-1',
      ahora: '2026-06-16T12:00:00.000Z',
    }
  )

  assert.equal(duplicada.id, 'duplicada-1')
  assert.equal(duplicada.nombre, 'Linea principal (copia)')
  assert.equal(duplicada.periodo, '2026-06')
  assert.equal(duplicada.obra, 'MICROBACHEO')
  assert.equal(duplicada.ubicacion, 'AV COLON 2100/2300')
  assert.equal(duplicada.geometriaTipo, 'Línea')
  assert.deepEqual(duplicada.geometria, original.geometria)
  assert.equal(duplicada.estado, 'Finalizada')
  assert.equal(duplicada.version, 1)
  assert.equal(duplicada.deletedAt, null)
  assert.equal(
    duplicada.createdAt,
    '2026-06-16T12:00:00.000Z'
  )
  assert.equal(
    duplicada.updatedAt,
    '2026-06-16T12:00:00.000Z'
  )

  assert.equal('syncStatus' in duplicada, false)
  assert.equal('updatedBy' in duplicada, false)
  assert.equal('__focusKey' in duplicada, false)
})

test('clona la geometria para no compartir referencias', () => {
  const original = {
    obra: 'PAVIMENTACION',
    geometria: [[-38, -57]],
  }

  const duplicada = crearDuplicadoIntervencion(
    original,
    {
      id: 'dup',
      ahora: '2026-06-16T12:00:00.000Z',
    }
  )

  duplicada.geometria[0][0] = -39

  assert.equal(original.geometria[0][0], -38)
})

test('usa la obra como base del nombre cuando no hay nombre', () => {
  const duplicada = crearDuplicadoIntervencion(
    {
      obra: 'ALUMBRADO LED',
    },
    {
      id: 'dup',
      ahora: '2026-06-16T12:00:00.000Z',
    }
  )

  assert.equal(duplicada.nombre, 'ALUMBRADO LED (copia)')
})
