import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  crearBackupPaths,
  guardarConfig,
  leerConfig,
  obtenerCarpetaBackups,
} = require('../electron/backups/backupConfig.js')

function crearTempDir() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), 'emvial-config-test-')
  )
}

test('lee configuracion vacia si no existe o esta corrupta', () => {
  const dir = crearTempDir()

  try {
    const configPath = path.join(dir, 'config.json')

    assert.deepEqual(leerConfig(configPath), {})

    fs.writeFileSync(configPath, 'no-json')

    assert.deepEqual(leerConfig(configPath), {})
  } finally {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
})

test('guarda configuracion y resuelve carpeta activa', () => {
  const dir = crearTempDir()

  try {
    const configPath = path.join(dir, 'config.json')
    const defaultBackupsDir = path.join(dir, 'default')
    const customBackupsDir = path.join(dir, 'custom')

    assert.equal(
      obtenerCarpetaBackups({
        configPath,
        defaultBackupsDir,
      }),
      defaultBackupsDir
    )

    guardarConfig(configPath, {
      backupsDir: customBackupsDir,
    })

    assert.equal(
      obtenerCarpetaBackups({
        configPath,
        defaultBackupsDir,
      }),
      customBackupsDir
    )
  } finally {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
})

test('configura nueva carpeta copiando backups existentes', () => {
  const dir = crearTempDir()

  try {
    const configPath = path.join(dir, 'config.json')
    const defaultBackupsDir = path.join(dir, 'backups')
    const nuevaCarpeta = path.join(dir, 'externa')

    fs.mkdirSync(defaultBackupsDir, {
      recursive: true,
    })
    fs.writeFileSync(
      path.join(defaultBackupsDir, 'emvial_general_1.sqlite'),
      'backup'
    )

    const paths = crearBackupPaths({
      configPath,
      defaultBackupsDir,
    })

    const resultado =
      paths.configurarCarpeta(nuevaCarpeta)

    assert.equal(resultado.ok, true)
    assert.equal(paths.obtenerBackupsDir(), nuevaCarpeta)
    assert.equal(
      fs.existsSync(
        path.join(nuevaCarpeta, 'emvial_general_1.sqlite')
      ),
      true
    )
    assert.equal(
      leerConfig(configPath).backupsDir,
      nuevaCarpeta
    )
  } finally {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
})

test('rechaza subcarpetas dentro de la carpeta activa', () => {
  const dir = crearTempDir()

  try {
    const configPath = path.join(dir, 'config.json')
    const defaultBackupsDir = path.join(dir, 'backups')
    const subcarpeta = path.join(defaultBackupsDir, 'hija')

    const paths = crearBackupPaths({
      configPath,
      defaultBackupsDir,
    })

    const resultado =
      paths.configurarCarpeta(subcarpeta)

    assert.equal(resultado.ok, false)
  } finally {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    })
  }
})
