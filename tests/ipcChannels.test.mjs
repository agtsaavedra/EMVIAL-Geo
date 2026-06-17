import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const {
  IPC_CHANNELS,
  PRELOAD_API_CHANNELS,
} = require('../electron/ipc/channels.js')

test('define canales IPC unicos y API publica esperada', () => {
  const canales = Object.values(IPC_CHANNELS)
  const unicos = new Set(canales)

  assert.equal(unicos.size, canales.length)
  assert.deepEqual(
    Object.keys(PRELOAD_API_CHANNELS).sort(),
    [
      'abrirCarpetaBackups',
      'buscarDireccion',
      'configurarCarpetaBackups',
      'confirmarCierreApp',
      'crearBackupManual',
      'crearBackupPreventivo',
      'eliminarIntervencion',
      'guardarIntervencion',
      'guardarIntervencionesMasivo',
      'leerArchivoDatos',
      'limpiarCacheGeocoding',
      'obtenerDireccion',
      'obtenerEstadoApp',
      'obtenerEstadoGeocoding',
      'obtenerHistorialIntervencion',
      'obtenerIntervenciones',
      'restaurarBackupManual',
      'restaurarPeriodoManual',
    ]
  )
})

test('main y preload usan constantes IPC en lugar de literales de canal', () => {
  const main = fs.readFileSync(
    path.join(repoRoot, 'electron/main.js'),
    'utf-8'
  )
  const preload = fs.readFileSync(
    path.join(repoRoot, 'electron/preload.js'),
    'utf-8'
  )

  for (const canal of Object.values(IPC_CHANNELS)) {
    assert.equal(
      main.includes(`'${canal}'`),
      false,
      `main.js no debe registrar ${canal} como literal`
    )

    assert.equal(
      preload.includes(`'${canal}'`),
      false,
      `preload.js no debe invocar ${canal} como literal`
    )
  }
})
