import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  describirEventoHistorial,
  formatearFechaHistorial,
  formatearValorHistorial,
  obtenerCambiosHistorial,
  obtenerTituloAccionHistorial,
} = loadPureModule(
  'src/services/historyFormatter.js',
  [
    'describirEventoHistorial',
    'formatearFechaHistorial',
    'formatearValorHistorial',
    'obtenerCambiosHistorial',
    'obtenerTituloAccionHistorial',
  ]
)

test('filtra campos tecnicos del historial', () => {
  const cambios = obtenerCambiosHistorial({
    cambios: {
      ubicacion: {
        anterior: 'A',
        actual: 'B',
      },
      updatedAt: {
        anterior: '2026',
        actual: '2027',
      },
      version: {
        anterior: 1,
        actual: 2,
      },
      syncStatus: {
        anterior: 'pending',
        actual: 'synced',
      },
    },
  })

  assert.deepEqual(
    cambios.map((cambio) => cambio.campo),
    ['ubicacion']
  )
})

test('describe cambios simples de forma humana', () => {
  const evento = {
    accion: 'editar',
    cambios: {
      metrosLineales: {
        anterior: '120',
        actual: '135',
      },
    },
  }

  assert.equal(
    describirEventoHistorial(evento),
    'Metros lineales: 120 -> 135.'
  )
  assert.equal(
    obtenerTituloAccionHistorial(evento),
    'Se edito la intervencion.'
  )
})

test('resume geometria por cantidad de puntos', () => {
  const evento = {
    accion: 'editar',
    cambios: {
      geometria: {
        anterior: [[-38, -57]],
        actual: [
          [-38, -57],
          [-38.1, -57.1],
        ],
      },
    },
  }

  const [cambio] = obtenerCambiosHistorial(evento)

  assert.equal(cambio.anterior, '1 punto')
  assert.equal(cambio.actual, '2 puntos')
  assert.equal(
    describirEventoHistorial(evento),
    'Se actualizo la geometria (1 punto -> 2 puntos).'
  )
})

test('resume multiples cambios mostrando los primeros campos', () => {
  const descripcion = describirEventoHistorial({
    accion: 'editar',
    cambios: {
      ubicacion: {
        anterior: 'A',
        actual: 'B',
      },
      barrio: {
        anterior: 'Centro',
        actual: 'La Perla',
      },
      cuadras: {
        anterior: '1',
        actual: '2',
      },
      fuente: {
        anterior: 'PDF',
        actual: 'Carga manual',
      },
    },
  })

  assert.equal(
    descripcion,
    'Se actualizaron Ubicacion, Barrio, Cuadras y 1 campo mas.'
  )
})

test('formatea valores vacios y fechas invalidas', () => {
  assert.equal(formatearValorHistorial(null), 'Sin dato')
  assert.equal(formatearValorHistorial(''), 'Sin dato')
  assert.equal(formatearFechaHistorial('no-fecha'), 'Sin fecha')
})

test('describe acciones principales sin cambios visibles', () => {
  assert.deepEqual(
    obtenerCambiosHistorial({
      accion: 'crear',
      cambios: {
        nombre: 'Linea',
        ubicacion: 'COLON 2100',
      },
    }),
    []
  )

  assert.equal(
    describirEventoHistorial({
      accion: 'crear',
    }),
    'Se creo la intervencion.'
  )
  assert.equal(
    describirEventoHistorial({
      accion: 'eliminar',
    }),
    'Se elimino la intervencion.'
  )
  assert.equal(
    describirEventoHistorial({
      accion: 'duplicar',
    }),
    'Se creo una copia independiente de otra intervencion.'
  )
  assert.equal(
    obtenerTituloAccionHistorial({
      accion: 'duplicar',
    }),
    'Se duplico la intervencion.'
  )
})
