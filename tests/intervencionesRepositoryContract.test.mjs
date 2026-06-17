import test from 'node:test'
import assert from 'node:assert/strict'

const {
  METODOS_REPOSITORIO_INTERVENCIONES,
  validarIntervencionesRepository,
} = await import('../src/repositories/intervencionesRepositoryContract.mjs')

test('define el contrato minimo del repositorio de intervenciones', () => {
  assert.deepEqual(
    METODOS_REPOSITORIO_INTERVENCIONES,
    [
      'obtenerTodas',
      'guardar',
      'guardarMasivo',
      'eliminar',
      'obtenerHistorial',
    ]
  )
})

test('acepta repositorios completos y rechaza incompletos', () => {
  const repository = {
    obtenerTodas() {},
    guardar() {},
    guardarMasivo() {},
    eliminar() {},
    obtenerHistorial() {},
  }

  assert.equal(
    validarIntervencionesRepository(repository),
    repository
  )

  assert.throws(
    () => validarIntervencionesRepository({
      obtenerTodas() {},
    }),
    /guardar, guardarMasivo, eliminar, obtenerHistorial/
  )
})
