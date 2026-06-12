function crearTablaIntervenciones(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS intervenciones (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

function crearTablaHistorial(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS historial_cambios (
      id TEXT PRIMARY KEY,
      intervencion_id TEXT NOT NULL,
      accion TEXT NOT NULL,
      cambios TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)
}

function obtenerTipoColumnaId(db) {
  const result = db.exec(`PRAGMA table_info(intervenciones)`)

  if (!result.length) return null

  const columnas = result[0].values
  const columnaId = columnas.find(
    (columna) => columna[1] === 'id'
  )

  return columnaId
    ? String(columnaId[2] || '').toUpperCase()
    : null
}

function asegurarEsquemaIntervenciones(db) {
  const existeTabla = db.exec(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'intervenciones'
  `)

  if (!existeTabla.length) {
    crearTablaIntervenciones(db)
    crearTablaHistorial(db)
    return
  }

  const tipoId = obtenerTipoColumnaId(db)

  if (tipoId === 'INTEGER') {
    db.run(`ALTER TABLE intervenciones RENAME TO intervenciones_old`)

    crearTablaIntervenciones(db)

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

  crearTablaHistorial(db)
}

module.exports = {
  crearTablaIntervenciones,
  crearTablaHistorial,
  asegurarEsquemaIntervenciones,
}
