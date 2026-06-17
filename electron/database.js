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
const {
  crearTablaIntervenciones:
    crearTablaIntervencionesSchema,
  crearTablaHistorial:
    crearTablaHistorialSchema,
  asegurarEsquemaIntervenciones:
    asegurarEsquemaIntervencionesSchema,
} = require('./db/schema')
const {
  limpiarBackupsAntiguos:
    limpiarBackupsAntiguosBackup,
  crearBackupGeneralAutomatico:
    crearBackupGeneralAutomaticoBackup,
  crearBackupPreRestauracion:
    crearBackupPreRestauracionBackup,
} = require('./backups/backupService')
const {
  crearBackupAutomaticoPeriodo,
  crearBackupManual:
    crearBackupManualOperacion,
  restaurarBackupManual:
    restaurarBackupManualOperacion,
  restaurarPeriodoManual:
    restaurarPeriodoManualOperacion,
} = require('./backups/backupOperations')
const {
  crearBackupPaths,
} = require('./backups/backupConfig')
const {
  crearHistorialRepository,
} = require('./db/historialRepository')
const {
  crearIntervencionesRepository,
} = require('./db/intervencionesRepository')

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

const backupPaths = crearBackupPaths({
  configPath,
  defaultBackupsDir,
})

// =====================================================
// CONSTANTES
// =====================================================

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
let escrituraArchivoPendiente = Promise.resolve()
let ultimoBackupAutomatico = null
let historialRepository
let intervencionesRepository

// =====================================================
// ESQUEMA / MIGRACIONES
// =====================================================

/**
 * Crea la tabla principal si todavía no existe.
 *
 * El id se guarda como TEXT para soportar UUID generados desde el renderer.
 * El campo data conserva la intervención completa serializada como JSON.
 */
/**
 * Consulta el tipo declarado de la columna id en la tabla intervenciones.
 *
 * Se usa para detectar bases antiguas donde id era INTEGER PRIMARY KEY.
 */
/**
 * Garantiza que la tabla intervenciones exista y tenga el esquema esperado.
 *
 * Si detecta una base antigua con id INTEGER, migra la tabla a id TEXT
 * conservando todos los datos existentes.
 */
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
  if (db && SQL) return db

  SQL = await initSqlJs()

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)

    asegurarEsquemaIntervencionesSchema(db)
    await guardarArchivo()

    return db
  }

  db = new SQL.Database()

  crearTablaIntervencionesSchema(db)
  crearTablaHistorialSchema(db)

  await guardarArchivo()

  return db
}

/**
 * Exporta el estado en memoria de sql.js y lo escribe en el archivo SQLite.
 *
 * sql.js trabaja en memoria, por eso cada cambio persistente debe terminar
 * llamando a esta función.
 */
function guardarArchivo() {
  escrituraArchivoPendiente =
    escrituraArchivoPendiente
      .catch(() => {})
      .then(async () => {
        const data = db.export()
        const tmpPath = `${dbPath}.tmp`

        await fs.promises.writeFile(
          tmpPath,
          Buffer.from(data)
        )

        await fs.promises.rename(
          tmpPath,
          dbPath
        )
      })

  return escrituraArchivoPendiente
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

async function ejecutarBackupsAutomaticosPendientes() {
  if (!backupDirty) return false

  await guardarArchivo()

  crearBackupGeneralAutomatico()

  periodosDirty.forEach((periodo) => {
    crearBackupAutomatico(periodo)
  })

  ultimoBackupAutomatico = new Date().toISOString()
  limpiarBackupPendiente()

  return true
}

function iniciarProgramadorBackupsAutomaticos() {
  if (intervaloBackupAutomatico) return

  intervaloBackupAutomatico = setInterval(async () => {
    try {
      await ejecutarBackupsAutomaticosPendientes()
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
// =====================================================
// HELPERS DE CARPETAS
// =====================================================

/**
 * Crea una carpeta de manera recursiva si todavía no existe.
 */
/**
 * Garantiza que exista la carpeta activa de backups.
 */
function asegurarCarpetaBackups() {
  backupPaths.asegurarCarpetaBackups()
}

/**
 * Devuelve la carpeta donde se guardan los backups generales automáticos.
 */
function obtenerCarpetaBackupsGeneral() {
  return backupPaths.obtenerCarpetaGeneral()
}

/**
 * Construye la ruta de backups para un período específico.
 *
 * El período esperado es YYYY-MM. Si el valor no es válido, usa SIN_PERIODO.
 */
function obtenerCarpetaPeriodo(periodo) {
  return backupPaths.obtenerCarpetaPeriodoActiva(periodo)
}

function obtenerBackupsDir() {
  return backupPaths.obtenerBackupsDir()
}

function obtenerDBActiva() {
  if (!db) {
    throw new Error('La base de datos no esta inicializada.')
  }

  return db
}

function obtenerHistorialRepositoryInstancia() {
  if (!historialRepository) {
    historialRepository = crearHistorialRepository({
      obtenerDB: obtenerDBActiva,
    })
  }

  return historialRepository
}

function registrarHistorialCambio(cambio) {
  return obtenerHistorialRepositoryInstancia()
    .registrarHistorialCambio(cambio)
}

function obtenerIntervencionesRepositoryInstancia() {
  if (!intervencionesRepository) {
    intervencionesRepository =
      crearIntervencionesRepository({
        asegurarDB: iniciarDB,
        guardarArchivo,
        marcarBackupPendiente,
        registrarHistorialCambio,
      })
  }

  return intervencionesRepository
}

/**
 * Indica si dos rutas apuntan exactamente a la misma carpeta resuelta.
 */
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
  return obtenerIntervencionesRepositoryInstancia()
    .obtenerIntervenciones()
}

/**
 * Inserta o actualiza una intervención en SQLite.
 *
 * Usa id como TEXT para aceptar UUID. Luego persiste el archivo y genera
 * backups automáticos general y por período.
 */
async function guardarIntervencion(intervencion) {
  return obtenerIntervencionesRepositoryInstancia()
    .guardarIntervencion(intervencion)
}

/**
 * Elimina una intervención por id.
 *
 * Antes de borrar, lee el período de la intervención para poder actualizar
 * también el backup automático de ese período.
 */
async function eliminarIntervencion(id) {
  return obtenerIntervencionesRepositoryInstancia()
    .eliminarIntervencion(id)
}

async function guardarIntervencionesMasivo(intervenciones = []) {
  return obtenerIntervencionesRepositoryInstancia()
    .guardarIntervencionesMasivo(intervenciones)
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
  return crearBackupGeneralAutomaticoBackup({
    dbPath,
    backupsGeneralDir:
      obtenerCarpetaBackupsGeneral(),
  })
}

/**
 * Crea un backup automático que contiene solo intervenciones de un período.
 *
 * Esto permite restaurar un mes sin reemplazar toda la base de trabajo.
 */
function crearBackupAutomatico(periodo) {
  return crearBackupAutomaticoPeriodo({
    db,
    SQL,
    periodo,
    obtenerCarpetaPeriodo,
    limpiarBackupsAntiguos,
  })
}

/**
 * Mantiene únicamente los 10 backups más recientes de una carpeta.
 *
 * Reduce acumulación de archivos durante cargas intensivas.
 */
function limpiarBackupsAntiguos(carpeta) {
  return limpiarBackupsAntiguosBackup(carpeta)
}

/**
 * Crea un backup de seguridad antes de restaurar datos.
 *
 * Sirve como punto de recuperación si el usuario restaura un archivo equivocado.
 */
function crearBackupPreRestauracion() {
  return crearBackupPreRestauracionBackup({
    dbPath,
    backupsGeneralDir:
      obtenerCarpetaBackupsGeneral(),
  })
}

async function crearBackupPreventivo(motivo = 'manual') {
  if (!db) await iniciarDB()

  await guardarArchivo()

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

  return crearBackupManualOperacion({
    dialog,
    dbPath,
    periodo,
    guardarArchivo,
    asegurarCarpetaBackups,
    obtenerBackupsDir,
  })
}

/**
 * Restaura una base SQLite completa seleccionada por el usuario.
 *
 * Antes de reemplazar la base viva crea un backup de pre-restauración.
 */
async function restaurarBackupManual() {
  return restaurarBackupManualOperacion({
    dialog,
    obtenerBackupsDir,
    asegurarCarpetaBackups,
    crearBackupPreRestauracion,
    reemplazarBaseDesdeBackup: async (backupPath) => {
      fs.copyFileSync(backupPath, dbPath)
      db = null
      historialRepository = null
      intervencionesRepository = null
      await iniciarDB()
    },
  })
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
  if (!db) await iniciarDB()

  return restaurarPeriodoManualOperacion({
    periodo,
    db,
    SQL,
    dialog,
    obtenerCarpetaPeriodo,
    crearBackupPreRestauracion,
    guardarArchivo,
    marcarBackupPendiente,
    ejecutarBackupsAutomaticosPendientes,
  })
}

// =====================================================
// CARPETA DE BACKUPS
// =====================================================

/**
 * Abre la carpeta activa de backups en el explorador del sistema operativo.
 */
async function abrirCarpetaBackups() {
  asegurarCarpetaBackups()

  await shell.openPath(obtenerBackupsDir())

  return true
}

/**
 * Permite elegir una nueva carpeta de backups.
 *
 * Copia los backups existentes al nuevo destino sin borrar la carpeta anterior.
 */
async function configurarCarpetaBackups() {
  const resultado = await dialog.showOpenDialog({
    title: 'Seleccionar carpeta de backups',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: obtenerBackupsDir(),
  })

  if (resultado.canceled || !resultado.filePaths.length) {
    return {
      ok: false,
      message: 'Selección cancelada.',
    }
  }

  const nuevaCarpeta = resultado.filePaths[0]

  try {
    return backupPaths.configurarCarpeta(nuevaCarpeta)
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
    appVersion: app.getVersion(),
    appName: app.getName(),
    dbPath,
    dbExiste: fs.existsSync(dbPath),
    configPath,
    backupsDir: obtenerBackupsDir(),
    defaultBackupsDir,
    backupPendiente: backupDirty,
    periodosBackupPendiente: Array.from(periodosDirty),
    ultimoBackupAutomatico,
  }
}

async function obtenerHistorialIntervencion(id) {
  await iniciarDB()

  return obtenerHistorialRepositoryInstancia()
    .obtenerHistorialIntervencion(id)
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
  obtenerHistorialIntervencion,
  iniciarProgramadorBackupsAutomaticos,
  ejecutarBackupsAutomaticosPendientes,
}
