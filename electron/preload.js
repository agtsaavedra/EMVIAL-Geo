const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  buscarDireccion: (direccion) => ipcRenderer.invoke('buscar-direccion', direccion),
  obtenerDireccion: (lat, lon) => ipcRenderer.invoke('obtener-direccion', lat, lon),
})