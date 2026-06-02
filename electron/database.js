const path = require('path')
const fs = require('fs')
const initSqlJs = require('sql.js')
const { app, dialog, shell } = require('electron')

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Base viva de la aplicación.
// IMPORTANTE: esta NO se mueve al cambiar carpeta de backups.
const dbPath = path.join(app.getPath('userData'), 'emvial.sqlite')

// Archivo de configuración local.
const configPath = path.join(app.getPath('userData'), 'config.json')

// Carpeta de backups por defecto.
const defaultBackupsDir = path.join(app.getPath('userData'), 'backups')

// Carpeta activa de backups.
// Puede ser la default o una carpeta elegida por el usuario.
let backupsDir = obtenerCarpetaBackups()

// =====================================================
// CONSTANTES
// =====================================================

const MESES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
]

// =====================================================
// ESTADO SQLITE
// =====================================================

let SQL
let db

// =====================================================
// ESQUEMA / MIGRACIONES
// =====================================================

function crearTablaIntervenciones() {
  db.run(`
    CREATE TABLE IF NOT EXISTS intervenciones (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

function obtenerTipoColumnaId() {
  const result = db.exec(`PRAGMA table_info(intervenciones)`)

  if (!result.length) return null

  const columnas = result[0].values
  const columnaId = columnas.find((columna) => columna[1] === 'id')

  return columnaId ? String(columnaId[2] || '').toUpperCase() : null
}

function asegurarEsquemaIntervenciones() {
  const existeTabla = db.exec(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'intervenciones'
  `)

  if (!existeTabla.length) {
    crearTablaIntervenciones()
    return
  }

  const tipoId = obtenerTipoColumnaId()

  // Versiones anteriores usaban INTEGER PRIMARY KEY.
  // Para soportar crypto.randomUUID(), migramos id a TEXT.
  if (tipoId === 'INTEGER') {
    db.run(`ALTER TABLE intervenciones RENAME TO intervenciones_old`)

    crearTablaIntervenciones()

    db.run(`
      INSERT INTO intervenciones (
        id,
        data,
        created_at,
        updated_at
      )
      SELECT
        CAST(id AS TEXT),
        data,
        created_at,
        updated_at
      FROM intervenciones_old
    `)

    db.run(`DROP TABLE intervenciones_old`)
  }
}

// =====================================================
// INICIALIZACIÓN DB
// =====================================================

async function iniciarDB() {
  SQL = await initSqlJs()

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)

    asegurarEsquemaIntervenciones()
    guardarArchivo()

    return
  }

  db = new SQL.Database()

  crearTablaIntervenciones()

  guardarArchivo()
}

function guardarArchivo() {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

// =====================================================
// CONFIGURACIÓN
// =====================================================

function leerConfig() {
  if (!fs.existsSync(configPath)) {
    return {}
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch {
    return {}
  }
}

function guardarConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

function obtenerCarpetaBackups() {
  const config = leerConfig()
  return config.backupsDir || defaultBackupsDir
}

// =====================================================
// HELPERS DE CARPETAS
// =====================================================

function asegurarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true })
  }
}

function asegurarCarpetaBackups() {
  asegurarCarpeta(backupsDir)
}

function obtenerCarpetaBackupsGeneral() {
  return path.join(backupsDir, '_GENERAL')
}

function obtenerCarpetaPeriodo(periodo) {
  if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
    return path.join(backupsDir, 'SIN_PERIODO')
  }

  const [anio, mes] = periodo.split('-')
  const nombreMes = MESES[Number(mes) - 1] || mes

  return path.join(backupsDir, `${periodo}_${nombreMes}`)
}

function sonMismaCarpeta(origen, destino) {
  return path.resolve(origen) === path.resolve(destino)
}

function destinoEstaDentroDeOrigen(origen, destino) {
  const origenResolved = path.resolve(origen)
  const destinoResolved = path.resolve(destino)

  return destinoResolved.startsWith(origenResolved + path.sep)
}

// Copia recursiva segura.
// No borra la carpeta original y no pisa archivos existentes.
function copiarCarpetaSiExiste(origen, destino) {
  if (!fs.existsSync(origen)) return

  asegurarCarpeta(destino)

  const items = fs.readdirSync(origen, { withFileTypes: true })

  items.forEach((item) => {
    const origenItem = path.join(origen, item.name)
    const destinoItem = path.join(destino, item.name)

    if (item.isDirectory()) {
      copiarCarpetaSiExiste(origenItem, destinoItem)
      return
    }

    if (item.isFile() && !fs.existsSync(destinoItem)) {
      fs.copyFileSync(origenItem, destinoItem)
    }
  })
}

// =====================================================
// CRUD INTERVENCIONES
// =====================================================

async function obtenerIntervenciones() {
  if (!db) await iniciarDB()

  const result = db.exec(`
    SELECT data
    FROM intervenciones
    ORDER BY updated_at DESC, created_at DESC
  `)

  if (!result.length) return []

  return result[0].values.map(([data]) => JSON.parse(data))
}

async function guardarIntervencion(intervencion) {
  if (!db) await iniciarDB()

  const ahora = new Date().toISOString()

  const nueva = {
    ...intervencion,
    id: String(intervencion.id || Date.now()),
  }

  const buscarExistente = db.prepare(`
    SELECT id
    FROM intervenciones
    WHERE id = ?
  `)

  buscarExistente.bind([nueva.id])

  const existe = buscarExistente.step()

  buscarExistente.free()

  if (existe) {
    db.run(
      `
      UPDATE intervenciones
      SET data = ?, updated_at = ?
      WHERE id = ?
      `,
      [JSON.stringify(nueva), ahora, nueva.id]
    )
  } else {
    db.run(
      `
      INSERT INTO intervenciones
      (id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      `,
      [nueva.id, JSON.stringify(nueva), ahora, ahora]
    )
  }

  guardarArchivo()
  crearBackupGeneralAutomatico()
  crearBackupAutomatico(nueva.periodo)

  return nueva
}

async function eliminarIntervencion(id) {
  if (!db) await iniciarDB()

  const idNormalizado = String(id)

  const buscarIntervencion = db.prepare(`
    SELECT data
    FROM intervenciones
    WHERE id = ?
  `)

  buscarIntervencion.bind([idNormalizado])

  let periodo = null

  if (buscarIntervencion.step()) {
    const data = JSON.parse(
      buscarIntervencion.get()[0]
    )

    periodo = data.periodo
  }

  buscarIntervencion.free()

  db.run(
    `DELETE FROM intervenciones WHERE id = ?`,
    [idNormalizado]
  )

  guardarArchivo()
  crearBackupGeneralAutomatico()
  crearBackupAutomatico(periodo)

  return true
}

// =====================================================
// BACKUPS AUTOMÁTICOS
// =====================================================

function crearBackupGeneralAutomatico() {
  if (!fs.existsSync(dbPath)) return

  const backupsGeneralDir = obtenerCarpetaBackupsGeneral()
  asegurarCarpeta(backupsGeneralDir)

  const fecha = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replaceAll('.', '-')

  const backupPath = path.join(
    backupsGeneralDir,
    `emvial_general_${fecha}.sqlite`
  )

  fs.copyFileSync(dbPath, backupPath)

  limpiarBackupsAntiguos(backupsGeneralDir)
}

function crearBackupAutomatico(periodo) {
  if (!db || !periodo) return

  const carpetaPeriodo = obtenerCarpetaPeriodo(periodo)
  asegurarCarpeta(carpetaPeriodo)

  const backupPeriodo = new SQL.Database()

  backupPeriodo.run(`
    CREATE TABLE IF NOT EXISTS intervenciones (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  const result = db.exec(`
    SELECT id, data, created_at, updated_at
    FROM intervenciones
  `)

  if (result.length) {
    result[0].values.forEach(([id, data, createdAt, updatedAt]) => {
      const intervencion = JSON.parse(data)

      if (intervencion.periodo === periodo) {
        backupPeriodo.run(
          `
          INSERT INTO intervenciones
          (id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?)
          `,
          [id, data, createdAt, updatedAt]
        )
      }
    })
  }

  const fecha = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replaceAll('.', '-')

  const backupPath = path.join(
    carpetaPeriodo,
    `emvial_periodo_${periodo}_${fecha}.sqlite`
  )

  const data = backupPeriodo.export()
  fs.writeFileSync(backupPath, Buffer.from(data))

  limpiarBackupsAntiguos(carpetaPeriodo)
}

function limpiarBackupsAntiguos(carpeta) {
  if (!fs.existsSync(carpeta)) return

  const backups = fs
    .readdirSync(carpeta)
    .filter((file) => {
      return (
        file.endsWith('.sqlite') &&
        (
          file.startsWith('emvial_general_') ||
          file.startsWith('emvial_periodo_') ||
          file.startsWith('emvial_auto_')
        )
      )
    })
    .map((file) => {
      const fullPath = path.join(carpeta, file)

      return {
        file,
        path: fullPath,
        mtime: fs.statSync(fullPath).mtime.getTime(),
      }
    })
    .sort((a, b) => b.mtime - a.mtime)

  const sobrantes = backups.slice(10)

  sobrantes.forEach((backup) => {
    fs.unlinkSync(backup.path)
  })
}

function crearBackupPreRestauracion() {
  if (!fs.existsSync(dbPath)) return null

  const backupsGeneralDir =
    obtenerCarpetaBackupsGeneral()

  asegurarCarpeta(backupsGeneralDir)

  const fecha = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replaceAll('.', '-')

  const backupPath = path.join(
    backupsGeneralDir,
    `emvial_pre_restauracion_${fecha}.sqlite`
  )

  fs.copyFileSync(dbPath, backupPath)

  return backupPath
}

// =====================================================
// BACKUP MANUAL / RESTAURACIÓN GENERAL
// =====================================================

async function crearBackupManual(periodo) {
  if (!db) await iniciarDB()

  guardarArchivo()
  asegurarCarpetaBackups()

  const fecha = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replaceAll('.', '-')

  const resultado = await dialog.showSaveDialog({
    title: 'Guardar backup de EMVIAL Geo',
    defaultPath: path.join(
      backupsDir,
      `emvial_backup_${periodo || 'sin_periodo'}_${fecha}.sqlite`
    ),
    filters: [
      { name: 'Base SQLite', extensions: ['sqlite'] },
    ],
  })

  if (resultado.canceled || !resultado.filePath) {
    return { ok: false, message: 'Backup cancelado.' }
  }

  fs.copyFileSync(dbPath, resultado.filePath)

  return {
    ok: true,
    path: resultado.filePath,
  }
}

async function restaurarBackupManual() {
  asegurarCarpetaBackups()

  const resultado = await dialog.showOpenDialog({
    title: 'Restaurar backup de EMVIAL Geo',
    defaultPath: backupsDir,
    properties: ['openFile'],
    filters: [
      { name: 'Base SQLite', extensions: ['sqlite'] },
    ],
  })

  if (resultado.canceled || !resultado.filePaths.length) {
    return { ok: false, message: 'Restauración cancelada.' }
  }

  const backupPath = resultado.filePaths[0]
  const backupSeguridad =
    crearBackupPreRestauracion()

  fs.copyFileSync(backupPath, dbPath)

  db = null
  await iniciarDB()

  return {
    ok: true,
    path: backupPath,
    backupSeguridad,
  }
}

// =====================================================
// RESTAURACIÓN POR PERÍODO
// =====================================================

async function restaurarPeriodoManual(periodo) {
  if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
    return {
      ok: false,
      message: 'Periodo inválido.',
    }
  }

  if (!db) await iniciarDB()


  const carpetaPeriodo = obtenerCarpetaPeriodo(periodo)
  asegurarCarpeta(carpetaPeriodo)

  const resultado = await dialog.showOpenDialog({
    title: `Restaurar periodo ${periodo}`,
    defaultPath: carpetaPeriodo,
    properties: ['openFile'],
    filters: [
      { name: 'Backup SQLite', extensions: ['sqlite'] },
    ],
  })

  if (resultado.canceled || !resultado.filePaths.length) {
    return {
      ok: false,
      message: 'Restauración cancelada.',
    }
  }

  const backupPath = resultado.filePaths[0]
  const fileBuffer = fs.readFileSync(backupPath)
  const backupDb = new SQL.Database(fileBuffer)

  const result = backupDb.exec(`
    SELECT id, data, created_at, updated_at
    FROM intervenciones
  `)
  const backupSeguridad =
    crearBackupPreRestauracion()


  db.run(
    `DELETE FROM intervenciones WHERE json_extract(data, '$.periodo') = ?`,
    [periodo]
  )

  if (result.length) {
    result[0].values.forEach(([id, data, createdAt, updatedAt]) => {
      const intervencion = JSON.parse(data)

      if (intervencion.periodo === periodo) {
        db.run(
          `
          INSERT INTO intervenciones
          (id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?)
          `,
          [id, data, createdAt, updatedAt]
        )
      }
    })
  }

  guardarArchivo()
  crearBackupGeneralAutomatico()
  crearBackupAutomatico(periodo)

  return {
    ok: true,
    path: backupPath,
    backupSeguridad,
  }
}

// =====================================================
// CARPETA DE BACKUPS
// =====================================================

async function abrirCarpetaBackups() {
  asegurarCarpetaBackups()

  await shell.openPath(backupsDir)

  return true
}

async function configurarCarpetaBackups() {
  const carpetaAnterior = backupsDir

  const resultado = await dialog.showOpenDialog({
    title: 'Seleccionar carpeta de backups',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: backupsDir,
  })

  if (resultado.canceled || !resultado.filePaths.length) {
    return {
      ok: false,
      message: 'Selección cancelada.',
    }
  }

  const nuevaCarpeta = resultado.filePaths[0]

  if (sonMismaCarpeta(carpetaAnterior, nuevaCarpeta)) {
    return {
      ok: true,
      path: backupsDir,
      message: 'La carpeta seleccionada ya era la carpeta activa.',
    }
  }

  if (destinoEstaDentroDeOrigen(carpetaAnterior, nuevaCarpeta)) {
    return {
      ok: false,
      message:
        'No se puede elegir una subcarpeta dentro de la carpeta actual de backups.',
    }
  }

  try {
    asegurarCarpeta(nuevaCarpeta)

    // Copia los backups ya existentes.
    // No borra la carpeta anterior para evitar pérdida accidental.
    copiarCarpetaSiExiste(carpetaAnterior, nuevaCarpeta)

    backupsDir = nuevaCarpeta

    const config = leerConfig()
    config.backupsDir = backupsDir
    guardarConfig(config)

    return {
      ok: true,
      path: backupsDir,
      previousPath: carpetaAnterior,
      message:
        'Carpeta de backups configurada correctamente. Los backups anteriores fueron copiados y la carpeta vieja quedó como respaldo.',
    }
  } catch (error) {
    return {
      ok: false,
      message: `No se pudo configurar la carpeta de backups: ${error.message}`,
    }
  }
}

function obtenerEstadoApp() {
  return {
    dbPath,
    configPath,
    backupsDir,
    defaultBackupsDir,
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  obtenerIntervenciones,
  guardarIntervencion,
  eliminarIntervencion,
  crearBackupManual,
  restaurarBackupManual,
  abrirCarpetaBackups,
  restaurarPeriodoManual,
  configurarCarpetaBackups,
  obtenerEstadoApp,
}
