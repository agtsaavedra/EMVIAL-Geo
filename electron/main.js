/**
 * Proceso principal de Electron para EMVIAL Geo.
 *
 * Responsabilidades:
 * - Crear la ventana principal.
 * - Registrar canales IPC seguros para el renderer.
 * - Ejecutar geocodificación mediante Nominatim desde el proceso principal.
 * - Exponer operaciones de base de datos y backups al renderer.
 * - Proteger el cierre accidental de la aplicación.
 */
const {
  app,
  BrowserWindow,
  ipcMain,
  session,
  shell,
} = require('electron')
const path = require('path')
const fs = require('fs')
const {
  crearNominatimClient,
} = require('./geocoding/nominatimClient')
const logger = require('./logger')
const {
  validarArchivoDatos,
  validarId,
  validarIntervencion,
  validarIntervencionesMasivo,
  validarPeriodo,
} = require('./validation')

// Nombre de la app en Windows
app.setName('EMVIAL Geo')

// Detecta si estamos en desarrollo o build
const isDev = !app.isPackaged
const DEV_SERVER_URL = 'http://127.0.0.1:5173'
const CSP_PRODUCCION = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "connect-src 'self'",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
].join('; ')

let nominatimClient = null

function obtenerNominatimClient() {
  if (!nominatimClient) {
    nominatimClient = crearNominatimClient({
      cachePath: path.join(
        app.getPath('userData'),
        'geocoding-cache.json'
      ),
    })
  }

  return nominatimClient
}

// Base de datos / backups
const {
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
} = require('./database')

//
// ===============================
// CREAR VENTANA
// ===============================
//

/**
 * Crea y configura la ventana principal de la aplicación.
 *
 * En desarrollo carga Vite y abre DevTools. En producción carga el build
 * estático desde dist/index.html.
 */
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function cargarServidorDev(win) {
  const maxIntentos = 40

  for (let intento = 1; intento <= maxIntentos; intento += 1) {
    try {
      await win.loadURL(DEV_SERVER_URL)
      return
    } catch (error) {
      if (intento === maxIntentos) {
        logger.error(
          `No se pudo cargar Vite en ${DEV_SERVER_URL}`,
          error
        )
        throw error
      }

      await esperar(500)
    }
  }
}

function esUrlInterna(url) {
  if (isDev) {
    return url.startsWith(DEV_SERVER_URL)
  }

  return (
    url.startsWith('file://') ||
    url === 'about:blank'
  )
}

function configurarSeguridadVentana(win) {
  win.webContents.setWindowOpenHandler(
    ({ url }) => {
      if (url === 'about:blank') {
        return { action: 'allow' }
      }

      if (
        url.startsWith('https://') ||
        url.startsWith('http://')
      ) {
        shell.openExternal(url)
      }

      return { action: 'deny' }
    }
  )

  win.webContents.on(
    'will-navigate',
    (event, url) => {
      if (esUrlInterna(url)) return

      event.preventDefault()

      if (
        url.startsWith('https://') ||
        url.startsWith('http://')
      ) {
        shell.openExternal(url)
      }
    }
  )
}

function configurarSeguridadSesion() {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false)
    }
  )

  if (isDev) return

  session.defaultSession.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            CSP_PRODUCCION,
          ],
        },
      })
    }
  )
}

function obtenerRutaArchivoDatos(nombreArchivo) {
  validarArchivoDatos(nombreArchivo)

  return path.join(
    __dirname,
    isDev
      ? '../public/data'
      : '../dist/data',
    nombreArchivo
  )
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,

    autoHideMenuBar: true,

    title: 'EMVIAL Geo',

    icon: path.join(
      __dirname,
      '../public/icon.ico'
    ),

    webPreferences: {
      preload: path.join(
        __dirname,
        'preload.js'
      ),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // nombre visible
  win.setTitle('EMVIAL Geo')
  configurarSeguridadVentana(win)

  // proteger cierre accidental
  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()

      win.webContents.send(
        'app-close-request'
      )
    }
  })

  // Desarrollo
  if (isDev) {
    cargarServidorDev(win).catch(() => {})

    win.webContents.openDevTools()
  }

  // Producción
  else {
    win.loadFile(
      path.join(
        __dirname,
        '../dist/index.html'
      )
    )
  }
}

//
// ===============================
// IPC - GEOCODING
// ===============================
//

// Confirma desde el renderer que el usuario aceptó cerrar la app.
ipcMain.handle('confirmar-cierre-app', () => {
  app.isQuiting = true
  app.quit()
})


// Busca direcciones usando Nominatim con consultas progresivas para Mar del Plata.
ipcMain.handle(
  'buscar-direccion',
  async (event, direccion) => {
    try {
      return await obtenerNominatimClient()
        .buscarDireccion(direccion)
    } catch (error) {
      logger.warn(
        'No se pudo geocodificar la direccion:',
        error.message
      )

      return []
    }
  }
)

// Obtiene una dirección legible a partir de coordenadas lat/lon.
ipcMain.handle(
  'obtener-direccion',
  async (event, lat, lon) => {
    try {
      return await obtenerNominatimClient()
        .obtenerDireccion(lat, lon)
    } catch (error) {
      logger.warn(
        'No se pudo obtener direccion inversa:',
        error.message
      )

      return ''
    }
  }
)

//
// ===============================
// IPC - INTERVENCIONES
// ===============================
//

// Devuelve al renderer todas las intervenciones persistidas.
ipcMain.handle(
  'obtener-intervenciones',
  async () => {
    return await obtenerIntervenciones()
  }
)

// Inserta o actualiza una intervención recibida desde el renderer.
ipcMain.handle(
  'guardar-intervencion',
  async (event, intervencion) => {
    return await guardarIntervencion(
      validarIntervencion(intervencion)
    )
  }
)

ipcMain.handle(
  'guardar-intervenciones-masivo',
  async (event, intervenciones) => {
    return await guardarIntervencionesMasivo(
      validarIntervencionesMasivo(intervenciones)
    )
  }
)

// Elimina una intervención por id.
ipcMain.handle(
  'eliminar-intervencion',
  async (event, id) => {
    return await eliminarIntervencion(
      validarId(id)
    )
  }
)

ipcMain.handle(
  'obtener-historial-intervencion',
  async (event, id) => {
    return obtenerHistorialIntervencion(
      validarId(id)
    )
  }
)

//
// ===============================
// IPC - BACKUPS
// ===============================
//

// Crea un backup manual elegido por el usuario.
ipcMain.handle(
  'crear-backup-manual',
  async (event, periodo) => {
    return await crearBackupManual(
      validarPeriodo(periodo)
    )
  }
)

ipcMain.handle(
  'crear-backup-preventivo',
  async (event, motivo) => {
    return await crearBackupPreventivo(motivo)
  }
)

// Restaura una base completa desde un backup manual.
ipcMain.handle(
  'restaurar-backup-manual',
  async () => {
    return await restaurarBackupManual()
  }
)

// Abre la carpeta de backups en el explorador del sistema.
ipcMain.handle(
  'abrir-carpeta-backups',
  async () => {
    return await abrirCarpetaBackups()
  }
)

// Restaura únicamente las intervenciones de un período.
ipcMain.handle(
  'restaurar-periodo-manual',
  async (event, periodo) => {
    return await restaurarPeriodoManual(
      validarPeriodo(periodo)
    )
  }
)

// Permite elegir una nueva carpeta de backups.
ipcMain.handle(
  'configurar-carpeta-backups',
  async () => {
    return await configurarCarpetaBackups()
  }
)

// Devuelve información de rutas internas para diagnóstico.
ipcMain.handle(
  'obtener-estado-app',
  async () => {
    return obtenerEstadoApp()
  }
)

// Lee archivos GeoJSON estÃ¡ticos incluidos con la aplicaciÃ³n.
ipcMain.handle(
  'leer-archivo-datos',
  async (event, nombreArchivo) => {
    const ruta =
      obtenerRutaArchivoDatos(
        nombreArchivo
      )

    return await fs.promises.readFile(
      ruta,
      'utf-8'
    )
  }
)

ipcMain.handle(
  'obtener-estado-geocoding',
  async () => {
    return obtenerNominatimClient()
      .obtenerEstadoCache()
  }
)

ipcMain.handle(
  'limpiar-cache-geocoding',
  async () => {
    return obtenerNominatimClient()
      .limpiarCache()
  }
)

//
// ===============================
// APP READY
// ===============================
//

// Cuando Electron está listo, crea la ventana principal.
app.whenReady().then(() => {
  configurarSeguridadSesion()
  iniciarProgramadorBackupsAutomaticos()
  createWindow()
})

//
// ===============================
// CERRAR APP
// ===============================
//

// En Windows/Linux se cierra la app al cerrar todas las ventanas.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//
// ===============================
// REABRIR EN MAC
// ===============================
//

// En macOS permite recrear la ventana al activar la app desde el dock.
app.on('activate', () => {
  if (
    BrowserWindow.getAllWindows()
      .length === 0
  ) {
    createWindow()
  }
})
