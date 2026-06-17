import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  crearTimestampBackup,
  limpiarBackupsAntiguos,
  crearBackupGeneralAutomatico,
  crearBackupPreRestauracion,
} = require('../electron/backups/backupService.js')

function crearTempDir() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), 'emvial-backup-test-')
  )
}

test('crea timestamp seguro para nombres de archivo', () => {
  const fecha = new Date('2026-06-17T12:34:56.789Z')

  assert.equal(
    crearTimestampBackup(fecha),
    '2026-06-17T12-34-56-789Z'
  )
})

test('limpia backups antiguos y conserva los mas recientes', () => {
  const dir = crearTempDir()

  try {
    for (let index = 0; index < 12; index += 1) {
      const file = path.join(
        dir,
        `emvial_general_${index}.sqlite`
      )

      fs.writeFileSync(file, String(index))
      const fecha = new Date(2026, 0, index + 1)
      fs.utimesSync(file, fecha, fecha)
    }

    const eliminados =
      limpiarBackupsAntiguos(dir, 10)

    assert.equal(eliminados.length, 2)
    assert.equal(
      fs.readdirSync(dir)
        .filter((file) => file.endsWith('.sqlite'))
        .length,
      10
    )
  } finally {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
})

test('crea backup general y backup pre restauracion', () => {
  const dir = crearTempDir()

  try {
    const dbPath = path.join(dir, 'emvial.sqlite')
    const backupsGeneralDir = path.join(dir, '_GENERAL')

    fs.writeFileSync(dbPath, 'db')

    const general =
      crearBackupGeneralAutomatico({
        dbPath,
        backupsGeneralDir,
        fecha: new Date('2026-06-17T12:00:00.000Z'),
      })

    const preventivo =
      crearBackupPreRestauracion({
        dbPath,
        backupsGeneralDir,
        fecha: new Date('2026-06-17T13:00:00.000Z'),
      })

    assert.equal(fs.existsSync(general), true)
    assert.equal(fs.existsSync(preventivo), true)
    assert.equal(fs.readFileSync(general, 'utf-8'), 'db')
    assert.equal(fs.readFileSync(preventivo, 'utf-8'), 'db')
  } finally {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
})
