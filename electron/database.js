/**
 * Módulo de persistencia principal de EMVIAL Geo.
 *
 * Responsabilidades:
 * - Crear y mantener la base SQLite local mediante sql.js.
 * - Persistir intervenciones como registros JSON dentro de la tabla intervenciones.
 * - Crear backups automáticos generales y por período.
 * - Restaurar backups completos o únicamente un período específico.
 * - Administrar la carpeta configurable de backups.
 *
 * Nota de arquitectura:
 * La base viva siempre queda en app.getPath('userData'). La carpeta de backups
 * puede cambiarse, pero nunca reemplaza ni mueve la base activa de la aplicación.
 */
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

const INTERVALO_BACKUP_AUTOMATICO_MS =
  10 * 60 * 1000

// =====================================================
// ESTADO SQLITE
// =====================================================

let SQL
let db
let backupDirty = false
let periodosDirty = new Set()
let intervaloBackupAutomatico = null

// =====================================================
// ESQUEMA / MIGRACIONES
// =====================================================

/**
 * Crea la tabla principal si todavía no existe.
 *
 * El id se guarda como TEXT para soportar UUID generados desde el renderer.
 * El campo data conserva la intervención completa serializada como JSON.
 */
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

/**
 * Consulta el tipo declarado de la columna id en la tabla intervenciones.
 *
 * Se usa para detectar bases antiguas donde id era INTEGER PRIMARY KEY.
 */
function obtenerTipoColumnaId() {
  const result = db.exec(`PRAGMA table_info(intervenciones)`)

  if (!result.length) return null

  const columnas = result[0].values
  const columnaId = columnas.find((columna) => columna[1] === 'id')

  return columnaId ? String(columnaId[2] || '').toUpperCase() : null
}

/**
 * Garantiza que la tabla intervenciones exista y tenga el esquema esperado.
 *
 * Si detecta una base antigua con id INTEGER, migra la tabla a id TEXT
 * conservando todos los datos existentes.
 */
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

/**
 * Inicializa sql.js y abre la base local.
 *
 * Si existe un archivo de base, lo carga desde disco y aplica migraciones.
 * Si no existe, crea una base nueva con el esquema actual.
 */
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

/**
 * Exporta el estado en memoria de sql.js y lo escribe en el archivo SQLite.
 *
 * sql.js trabaja en memoria, por eso cada cambio persistente debe terminar
 * llamando a esta función.
 */
function guardarArchivo() {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function marcarBackupPendiente(periodo) {
  backupDirty = true

  if (periodo) {
    periodosDirty.add(periodo)
  }
}

function limpiarBackupPendiente() {
  backupDirty = false
  periodosDirty = new Set()
}

function ejecutarBackupsAutomaticosPendientes() {
  if (!backupDirty) return false

  crearBackupGeneralAutomatico()

  periodosDirty.forEach((periodo) => {
    crearBackupAutomatico(periodo)
  })

  limpiarBackupPendiente()

  return true
}

function iniciarProgramadorBackupsAutomaticos() {
  if (intervaloBackupAutomatico) return

  intervaloBackupAutomatico = setInterval(() => {
    try {
      ejecutarBackupsAutomaticosPendientes()
    } catch (error) {
      console.error(
        'Error al crear backups automáticos:',
        error
      )
    }
  }, INTERVALO_BACKUP_AUTOMATICO_MS)
}

// =====================================================
// CONFIGURACIÓN
// =====================================================

/**
 * Lee el archivo de configuración local de la aplicación.
 *
 * Si no existe o está corrupto, devuelve un objeto vacío para mantener
 * la app operativa.
 */
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

/**
 * Persiste la configuración local en formato JSON legible.
 */
function guardarConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

/**
 * Devuelve la carpeta activa de backups.
 *
 * Prioriza la carpeta elegida por el usuario y usa la carpeta por defecto
 * cuando todavía no hay configuración guardada.
 */
function obtenerCarpetaBackups() {
  const config = leerConfig()
  return config.backupsDir || defaultBackupsDir
}

// =====================================================
// HELPERS DE CARPETAS
// =====================================================

/**
 * Crea una carpeta de manera recursiva si todavía no existe.
 */
function asegurarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true })
  }
}

/**
 * Garantiza que exista la carpeta activa de backups.
 */
function asegurarCarpetaBackups() {
  asegurarCarpeta(backupsDir)
}

/**
 * Devuelve la carpeta donde se guardan los backups generales automáticos.
 */
function obtenerCarpetaBackupsGeneral() {
  return path.join(backupsDir, '_GENERAL')
}

/**
 * Construye la ruta de backups para un período específico.
 *
 * El período esperado es YYYY-MM. Si el valor no es válido, usa SIN_PERIODO.
 */
function obtenerCarpetaPeriodo(periodo) {
  if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
    return path.join(backupsDir, 'SIN_PERIODO')
  }

  const [anio, mes] = periodo.split('-')
  const nombreMes = MESES[Number(mes) - 1] || mes

  return path.join(backupsDir, `${periodo}_${nombreMes}`)
}

/**
 * Indica si dos rutas apuntan exactamente a la misma carpeta resuelta.
 */
function sonMismaCarpeta(origen, destino) {
  return path.resolve(origen) === path.resolve(destino)
}

/**
 * Evita elegir como nueva carpeta una subcarpeta de la carpeta actual.
 *
 * Esto previene copias recursivas peligrosas al migrar backups.
 */
function destinoEstaDentroDeOrigen(origen, destino) {
  const origenResolved = path.resolve(origen)
  const destinoResolved = path.resolve(destino)

  return destinoResolved.startsWith(origenResolved + path.sep)
}

// Copia recursiva segura.
// No borra la carpeta original y no pisa archivos existentes.
/**
 * Copia una carpeta de backups a otra ubicación de forma conservadora.
 *
 * No borra el origen y no pisa archivos existentes en destino.
 */
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

/**
 * Obtiene todas las intervenciones guardadas en la base activa.
 *
 * Devuelve objetos JavaScript reconstruidos desde el campo JSON data,
 * ordenados por fecha de actualización/creación descendente.
 */
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

/**
 * Inserta o actualiza una intervención en SQLite.
 *
 * Usa id como TEXT para aceptar UUID. Luego persiste el archivo y genera
 * backups automáticos general y por período.
 */
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
  marcarBackupPendiente(nueva.periodo)

  return nueva
}

/**
 * Elimina una intervención por id.
 *
 * Antes de borrar, lee el período de la intervención para poder actualizar
 * también el backup automático de ese período.
 */
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
  marcarBackupPendiente(periodo)

  return true
}

async function guardarIntervencionesMasivo(intervenciones = []) {
  if (!db) await iniciarDB()

  if (!Array.isArray(intervenciones) || !intervenciones.length) {
    return []
  }

  const guardadas = []
  const ahora = new Date().toISOString()

  db.run('BEGIN TRANSACTION')

  try {
    intervenciones.forEach((intervencion) => {
      const nueva = {
        ...intervencion,
        id: String(intervencion.id || `${Date.now()}-${guardadas.length}`),
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

      marcarBackupPendiente(nueva.periodo)
      guardadas.push(nueva)
    })

    db.run('COMMIT')
  } catch (error) {
    db.run('ROLLBACK')
    throw error
  }

  guardarArchivo()

  return guardadas
}

// =====================================================
// BACKUPS AUTOMÁTICOS
// =====================================================

/**
 * Crea una copia automática de la base completa.
 *
 * Se guarda en la carpeta _GENERAL y luego se limpian backups antiguos.
 */
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

/**
 * Crea un backup automático que contiene solo intervenciones de un período.
 *
 * Esto permite restaurar un mes sin reemplazar toda la base de trabajo.
 */
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

/**
 * Mantiene únicamente los 10 backups más recientes de una carpeta.
 *
 * Reduce acumulación de archivos durante cargas intensivas.
 */
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

/**
 * Crea un backup de seguridad antes de restaurar datos.
 *
 * Sirve como punto de recuperación si el usuario restaura un archivo equivocado.
 */
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

async function crearBackupPreventivo(motivo = 'manual') {
  if (!db) await iniciarDB()

  guardarArchivo()

  const backupPath =
    crearBackupPreRestauracion()

  return {
    ok: Boolean(backupPath),
    path: backupPath,
    motivo,
  }
}

// =====================================================
// BACKUP MANUAL / RESTAURACIÓN GENERAL
// =====================================================

/**
 * Permite al usuario elegir manualmente dónde guardar un backup SQLite.
 */
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

/**
 * Restaura una base SQLite completa seleccionada por el usuario.
 *
 * Antes de reemplazar la base viva crea un backup de pre-restauración.
 */
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

/**
 * Restaura únicamente las intervenciones de un período desde un backup.
 *
 * Elimina de la base activa las intervenciones del período elegido y luego
 * inserta las provenientes del backup seleccionado.
 */
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
  marcarBackupPendiente(periodo)
  ejecutarBackupsAutomaticosPendientes()

  return {
    ok: true,
    path: backupPath,
    backupSeguridad,
  }
}

// =====================================================
// CARPETA DE BACKUPS
// =====================================================

/**
 * Abre la carpeta activa de backups en el explorador del sistema operativo.
 */
async function abrirCarpetaBackups() {
  asegurarCarpetaBackups()

  await shell.openPath(backupsDir)

  return true
}

/**
 * Permite elegir una nueva carpeta de backups.
 *
 * Copia los backups existentes al nuevo destino sin borrar la carpeta anterior.
 */
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

/**
 * Devuelve rutas internas útiles para el diálogo Acerca de / diagnóstico.
 */
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
  guardarIntervencionesMasivo,
  eliminarIntervencion,
  crearBackupManual,
  crearBackupPreventivo,
  restaurarBackupManual,
  abrirCarpetaBackups,
  restaurarPeriodoManual,
  configurarCarpetaBackups,
  obtenerEstadoApp,
  iniciarProgramadorBackupsAutomaticos,
  ejecutarBackupsAutomaticosPendientes,
}
