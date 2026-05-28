const path = require('path')
const fs = require('fs')
const initSqlJs = require('sql.js')
const { app, dialog, shell } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'emvial.sqlite')


const backupsDir = path.join(app.getPath('userData'), 'backups')


let SQL
let db

async function iniciarDB() {
  SQL = await initSqlJs()

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()

    db.run(`
      CREATE TABLE IF NOT EXISTS intervenciones (
        id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    guardarArchivo()
    crearBackupAutomatico()
  }
}

function guardarArchivo() {
    const data = db.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
}

async function obtenerIntervenciones() {
    if (!db) await iniciarDB()

    const result = db.exec(`
    SELECT data
    FROM intervenciones
    ORDER BY id DESC
  `)

    if (!result.length) return []

    return result[0].values.map(([data]) => JSON.parse(data))
}

async function guardarIntervencion(intervencion) {
    if (!db) await iniciarDB()

    const ahora = new Date().toISOString()

    const existente = db.exec(`
    SELECT id
    FROM intervenciones
    WHERE id = ${intervencion.id}
  `)

    const nueva = {
        ...intervencion,
        id: intervencion.id || Date.now(),
    }

    if (existente.length) {
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

    return nueva
}

async function eliminarIntervencion(id) {
    if (!db) await iniciarDB()

    db.run(`DELETE FROM intervenciones WHERE id = ?`, [id])

    guardarArchivo()
    crearBackupAutomatico()

    return true
}

async function crearBackupManual() {
    if (!db) await iniciarDB()

    guardarArchivo()

    const fecha = new Date()
        .toISOString()
        .replaceAll(':', '-')
        .replaceAll('.', '-')

    const resultado = await dialog.showSaveDialog({
        title: 'Guardar backup de EMVIAL Geo',
        defaultPath: `emvial_backup_${fecha}.sqlite`,
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
    const resultado = await dialog.showOpenDialog({
        title: 'Restaurar backup de EMVIAL Geo',
        properties: ['openFile'],
        filters: [
            { name: 'Base SQLite', extensions: ['sqlite'] },
        ],
    })

    if (resultado.canceled || !resultado.filePaths.length) {
        return { ok: false, message: 'Restauración cancelada.' }
    }

    const backupPath = resultado.filePaths[0]

    fs.copyFileSync(backupPath, dbPath)

    // reiniciar conexión en memoria
    db = null
    await iniciarDB()

    return {
        ok: true,
        path: backupPath,
    }
}

function asegurarCarpetaBackups() {
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true })
    }
}

function crearBackupAutomatico() {
    if (!fs.existsSync(dbPath)) return

    asegurarCarpetaBackups()

    const fecha = new Date()
        .toISOString()
        .replaceAll(':', '-')
        .replaceAll('.', '-')

    const backupPath = path.join(
        backupsDir,
        `emvial_auto_${fecha}.sqlite`
    )

    fs.copyFileSync(dbPath, backupPath)

    limpiarBackupsAntiguos()
}

function limpiarBackupsAntiguos() {
    asegurarCarpetaBackups()

    const backups = fs
        .readdirSync(backupsDir)
        .filter((file) => file.startsWith('emvial_auto_') && file.endsWith('.sqlite'))
        .map((file) => ({
            file,
            path: path.join(backupsDir, file),
            mtime: fs.statSync(path.join(backupsDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime)

    const sobrantes = backups.slice(10)

    sobrantes.forEach((backup) => {
        fs.unlinkSync(backup.path)
    })
}

async function abrirCarpetaBackups() {
  asegurarCarpetaBackups()

  await shell.openPath(backupsDir)

  return true
}

module.exports = {
  obtenerIntervenciones,
  guardarIntervencion,
  eliminarIntervencion,
  crearBackupManual,
  restaurarBackupManual,
  abrirCarpetaBackups,
}