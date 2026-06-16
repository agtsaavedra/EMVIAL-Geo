import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  useAssetActions,
} = loadPureModule(
  'src/hooks/app/actions/useAssetActions.js',
  ['useAssetActions']
)

test('duplicar protegido abre confirmacion y duplica al confirmar', async () => {
  let dialogo
  const duplicadas = []
  const toasts = []

  const acciones = useAssetActions({
    confirmar: (config) => {
      dialogo = config
    },
    eliminarIntervencion: async () => {},
    restaurarIntervencion: async () => {},
    duplicarIntervencion: async (intervencion) => {
      duplicadas.push(intervencion.id)
    },
    mostrarToast: (...args) => {
      toasts.push(args)
    },
  })

  acciones.duplicarIntervencionProtegida({
    id: 'abc',
    nombre: 'Linea principal',
  })

  assert.equal(dialogo.titulo, 'Duplicar intervencion')
  assert.equal(dialogo.textoConfirmar, 'Duplicar')
  assert.match(dialogo.mensaje, /Linea principal/)
  assert.deepEqual(duplicadas, [])

  await dialogo.onConfirmar()

  assert.deepEqual(duplicadas, ['abc'])
  assert.deepEqual(toasts[0], [
    'Intervencion duplicada.',
    'success',
  ])
})

test('duplicar protegido informa error si falla la copia', async () => {
  let dialogo
  const toasts = []

  const acciones = useAssetActions({
    confirmar: (config) => {
      dialogo = config
    },
    eliminarIntervencion: async () => {},
    restaurarIntervencion: async () => {},
    duplicarIntervencion: async () => {
      throw new Error('fallo')
    },
    mostrarToast: (...args) => {
      toasts.push(args)
    },
  })

  acciones.duplicarIntervencionProtegida({
    id: 'abc',
    obra: 'MICROBACHEO',
  })

  await dialogo.onConfirmar()

  assert.deepEqual(toasts[0], [
    'No se pudo duplicar la intervencion.',
    'error',
  ])
})
