const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  win.loadURL('http://localhost:5173')
  win.webContents.openDevTools()
}

ipcMain.handle('buscar-direccion', async (event, direccion) => {
  const consultas = [
    `${direccion}, Mar del Plata, Buenos Aires, Argentina`,
    `${direccion}, General Pueyrredon, Buenos Aires, Argentina`,
    `${direccion}, Argentina`,
    direccion
  ]

  for (const consulta of consultas) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(consulta)}&limit=5&addressdetails=1&countrycodes=ar`

    const respuesta = await fetch(url, {
      headers: {
        'User-Agent': 'EMVIAL-App/1.0 (desarrollo local)',
        'Accept': 'application/json'
      }
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
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`

  const respuesta = await fetch(url, {
    headers: {
      'User-Agent': 'EMVIAL-App/1.0 (desarrollo local)',
      'Accept': 'application/json'
    }
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

app.whenReady().then(() => {
  createWindow()
})