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

const ARCHIVOS_DATOS_PERMITIDOS = new Set([
  'barrios.geojson',
  'calles-mar-del-plata.geojson',
])

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
        console.error(
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
  if (
    !ARCHIVOS_DATOS_PERMITIDOS.has(
      nombreArchivo
    )
  ) {
    throw new Error(
      'Archivo de datos no permitido.'
    )
  }

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
    const consultas = [
      `${direccion}, Mar del Plata, Buenos Aires, Argentina`,
      `${direccion}, General Pueyrredon, Buenos Aires, Argentina`,
      `${direccion}, Argentina`,
      direccion,
    ]

    for (const consulta of consultas) {
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=` +
        `${encodeURIComponent(
          consulta
        )}` +
        `&limit=5&addressdetails=1&countrycodes=ar`

      const respuesta = await fetch(url, {
        headers: {
          'User-Agent':
            'EMVIAL-App/1.0',
          Accept:
            'application/json',
        },
      })

      const texto =
        await respuesta.text()

      try {
        const datos =
          JSON.parse(texto)

        if (datos.length > 0) {
          console.log(
            'Consulta usada:',
            consulta
          )

          return datos
        }
      } catch {
        console.log(
          'Respuesta inesperada de Nominatim:',
          texto
        )
      }
    }

    return []
  }
)

// Obtiene una dirección legible a partir de coordenadas lat/lon.
ipcMain.handle(
  'obtener-direccion',
  async (event, lat, lon) => {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${lat}&lon=${lon}`

    const respuesta = await fetch(url, {
      headers: {
        'User-Agent':
          'EMVIAL-App/1.0',
        Accept:
          'application/json',
      },
    })

    const texto =
      await respuesta.text()

    try {
      const datos =
        JSON.parse(texto)

      return (
        datos.display_name || ''
      )
    } catch {
      console.log(
        'Respuesta inesperada de Nominatim:',
        texto
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
      intervencion
    )
  }
)

ipcMain.handle(
  'guardar-intervenciones-masivo',
  async (event, intervenciones) => {
    return await guardarIntervencionesMasivo(
      intervenciones
    )
  }
)

// Elimina una intervención por id.
ipcMain.handle(
  'eliminar-intervencion',
  async (event, id) => {
    return await eliminarIntervencion(
      id
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
      periodo
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
      periodo
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
