const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const {
  obtenerIntervenciones,
  guardarIntervencion,
  eliminarIntervencion,
  crearBackupManual,
  restaurarBackupManual,
  abrirCarpetaBackups,
  restaurarPeriodoManual,
  configurarCarpetaBackups,
} = require('./database')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    title: 'EMVIAL Geo',
    icon: path.join(__dirname, '../public/icon.ico'),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadURL('http://localhost:5173')

  // sacar después si querés
  win.webContents.openDevTools()
}

//
// ===============================
// IPC - GEOCODING
// ===============================
//

ipcMain.handle('buscar-direccion', async (event, direccion) => {
  const consultas = [
    `${direccion}, Mar del Plata, Buenos Aires, Argentina`,
    `${direccion}, General Pueyrredon, Buenos Aires, Argentina`,
    `${direccion}, Argentina`,
    direccion,
  ]

  for (const consulta of consultas) {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=` +
      `${encodeURIComponent(consulta)}` +
      `&limit=5&addressdetails=1&countrycodes=ar`

    const respuesta = await fetch(url, {
      headers: {
        'User-Agent': 'EMVIAL-App/1.0 (desarrollo local)',
        Accept: 'application/json',
      },
    })

    const texto = await respuesta.text()

    try {
      const datos = JSON.parse(texto)

      if (datos.length > 0) {
        console.log('Consulta usada:', consulta)
        return datos
      }
    } catch {
      console.log('Respuesta inesperada de Nominatim:', texto)
    }
  }

  return []
})

ipcMain.handle('obtener-direccion', async (event, lat, lon) => {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lon}`

  const respuesta = await fetch(url, {
    headers: {
      'User-Agent': 'EMVIAL-App/1.0 (desarrollo local)',
      Accept: 'application/json',
    },
  })

  const texto = await respuesta.text()

  try {
    const datos = JSON.parse(texto)
    return datos.display_name || ''
  } catch {
    console.log('Respuesta inesperada de Nominatim:', texto)
    return ''
  }
})

//
// ===============================
// IPC - INTERVENCIONES
// ===============================
//

ipcMain.handle('obtener-intervenciones', async () => {
  return await obtenerIntervenciones()
})

ipcMain.handle('guardar-intervencion', async (event, intervencion) => {
  return await guardarIntervencion(intervencion)
})

ipcMain.handle('eliminar-intervencion', async (event, id) => {
  return await eliminarIntervencion(id)
})

//
// ===============================
// IPC - BACKUPS
// ===============================
//

ipcMain.handle('crear-backup-manual', async (event, periodo) => {
  return await crearBackupManual(periodo)
})

ipcMain.handle('restaurar-backup-manual', async () => {
  return await restaurarBackupManual()
})

ipcMain.handle('abrir-carpeta-backups', async () => {
  return await abrirCarpetaBackups()
})

ipcMain.handle('restaurar-periodo-manual', async (event, periodo) => {
  return await restaurarPeriodoManual(periodo)
})

ipcMain.handle(
  'configurar-carpeta-backups',
  async () => {
    return await configurarCarpetaBackups()
  }
)
//
// ===============================
// APP READY
// ===============================
//

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})