const {
  crearIdHistorial,
  obtenerCambiosIntervencion,
} = require('./historyChanges')

function crearHistorialRepository({
  obtenerDB,
  crearId = crearIdHistorial,
  obtenerFecha = () => new Date().toISOString(),
} = {}) {
  if (typeof obtenerDB !== 'function') {
    throw new Error('crearHistorialRepository requiere obtenerDB')
  }

  function registrarHistorialCambio({
    intervencionId,
    accion,
    anterior = null,
    actual = null,
    fecha = obtenerFecha(),
  }) {
    const db = obtenerDB()

    db.run(
      `
      INSERT INTO historial_cambios
      (id, intervencion_id, accion, cambios, created_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        crearId(),
        String(intervencionId),
        accion,
        JSON.stringify(
          obtenerCambiosIntervencion(
            anterior,
            actual
          )
        ),
        fecha,
      ]
    )
  }

  function obtenerHistorialIntervencion(id) {
    const db = obtenerDB()
    const stmt = db.prepare(`
      SELECT
        id,
        intervencion_id AS intervencionId,
        accion,
        cambios,
        created_at AS fecha
      FROM historial_cambios
      WHERE intervencion_id = ?
      ORDER BY created_at DESC
    `)

    try {
      stmt.bind([String(id)])

      const filas = []

      while (stmt.step()) {
        const row = stmt.getAsObject()

        filas.push({
          ...row,
          cambios: JSON.parse(row.cambios || '[]'),
        })
      }

      return filas
    } finally {
      stmt.free()
    }
  }

  return {
    registrarHistorialCambio,
    obtenerHistorialIntervencion,
  }
}

module.exports = {
  crearHistorialRepository,
}
