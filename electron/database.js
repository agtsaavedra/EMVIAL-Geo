const path = require('path')
const fs = require('fs')
const initSqlJs = require('sql.js')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'emvial.sqlite')

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

  return true
}

module.exports = {
  obtenerIntervenciones,
  guardarIntervencion,
  eliminarIntervencion,
}