const {
  separarMetadataPersistencia,
} = require('./historyChanges')

function leerIntervencionPorId(db, id) {
  const stmt = db.prepare(`
    SELECT data
    FROM intervenciones
    WHERE id = ?
  `)

  try {
    stmt.bind([String(id)])

    if (!stmt.step()) {
      return {
        existe: false,
        data: null,
      }
    }

    return {
      existe: true,
      data: JSON.parse(stmt.get()[0] || '{}'),
    }
  } finally {
    stmt.free()
  }
}

function crearIntervencionesRepository({
  asegurarDB,
  guardarArchivo,
  marcarBackupPendiente,
  registrarHistorialCambio,
  crearId = () => Date.now(),
  obtenerFecha = () => new Date().toISOString(),
} = {}) {
  if (typeof asegurarDB !== 'function') {
    throw new Error('crearIntervencionesRepository requiere asegurarDB')
  }

  async function obtenerIntervenciones() {
    const db = await asegurarDB()

    const result = db.exec(`
      SELECT data
      FROM intervenciones
      ORDER BY updated_at DESC, created_at DESC
    `)

    if (!result.length) return []

    return result[0].values.map(([data]) => JSON.parse(data))
  }

  async function guardarIntervencion(intervencion) {
    const db = await asegurarDB()
    const ahora = obtenerFecha()
    const { datosPersistibles, metadata } =
      separarMetadataPersistencia(intervencion)

    const nueva = {
      ...datosPersistibles,
      id: String(datosPersistibles.id || crearId()),
    }

    const {
      existe,
      data: anterior,
    } = leerIntervencionPorId(db, nueva.id)

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

    registrarHistorialCambio({
      intervencionId: nueva.id,
      accion:
        !existe && metadata.historialAccion === 'duplicar'
          ? 'duplicar'
          : existe
            ? 'editar'
            : 'crear',
      anterior,
      actual: metadata.historialOrigenId
        ? {
            ...nueva,
            duplicadaDe: metadata.historialOrigenId,
          }
        : nueva,
      fecha: ahora,
    })

    await guardarArchivo()
    marcarBackupPendiente(nueva.periodo)

    return nueva
  }

  async function eliminarIntervencion(id) {
    const db = await asegurarDB()
    const idNormalizado = String(id)
    const {
      data: intervencionEliminada,
    } = leerIntervencionPorId(db, idNormalizado)

    db.run(
      `DELETE FROM intervenciones WHERE id = ?`,
      [idNormalizado]
    )

    if (intervencionEliminada) {
      registrarHistorialCambio({
        intervencionId: idNormalizado,
        accion: 'eliminar',
        anterior: intervencionEliminada,
        actual: null,
        fecha: obtenerFecha(),
      })
    }

    await guardarArchivo()
    marcarBackupPendiente(
      intervencionEliminada?.periodo ?? null
    )

    return true
  }

  async function guardarIntervencionesMasivo(intervenciones = []) {
    const db = await asegurarDB()

    if (!Array.isArray(intervenciones) || !intervenciones.length) {
      return []
    }

    const guardadas = []
    const ahora = obtenerFecha()

    db.run('BEGIN TRANSACTION')

    try {
      intervenciones.forEach((intervencion) => {
        const { datosPersistibles } =
          separarMetadataPersistencia(intervencion)
        const nueva = {
          ...datosPersistibles,
          id: String(datosPersistibles.id || `${crearId()}-${guardadas.length}`),
        }

        const {
          existe,
          data: anterior,
        } = leerIntervencionPorId(db, nueva.id)

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

        registrarHistorialCambio({
          intervencionId: nueva.id,
          accion: existe ? 'editar' : 'crear',
          anterior,
          actual: nueva,
          fecha: ahora,
        })

        marcarBackupPendiente(nueva.periodo)
        guardadas.push(nueva)
      })

      db.run('COMMIT')
    } catch (error) {
      db.run('ROLLBACK')
      throw error
    }

    await guardarArchivo()

    return guardadas
  }

  return {
    obtenerIntervenciones,
    guardarIntervencion,
    eliminarIntervencion,
    guardarIntervencionesMasivo,
  }
}

module.exports = {
  crearIntervencionesRepository,
  leerIntervencionPorId,
}
