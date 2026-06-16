import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  SYNC_STATUS,
  crearSyncAdapterLocal,
} = loadPureModule(
  'src/services/sync/syncAdapter.js',
  ['SYNC_STATUS', 'crearSyncAdapterLocal']
)

test('adaptador local conserva cambios como sincronizados', async () => {
  const adapter = crearSyncAdapterLocal()

  const estado = await adapter.obtenerEstado()
  const cambio = await adapter.encolarCambio({
    id: '1',
    tipo: 'intervencion',
  })
  const resumen =
    await adapter.sincronizarPendientes()

  assert.equal(estado.conectado, false)
  assert.equal(cambio.syncStatus, SYNC_STATUS.SYNCED)
  assert.deepEqual(resumen, {
    enviados: 0,
    recibidos: 0,
    conflictos: 0,
  })
})
