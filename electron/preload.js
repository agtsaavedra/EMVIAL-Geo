const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  buscarDireccion: (direccion) =>
    ipcRenderer.invoke('buscar-direccion', direccion),

  obtenerDireccion: (lat, lon) =>
    ipcRenderer.invoke('obtener-direccion', lat, lon),

  obtenerIntervenciones: () =>
    ipcRenderer.invoke('obtener-intervenciones'),

  guardarIntervencion: (intervencion) =>
    ipcRenderer.invoke('guardar-intervencion', intervencion),

  eliminarIntervencion: (id) =>
    ipcRenderer.invoke('eliminar-intervencion', id),

  crearBackupManual: (periodo) =>
    ipcRenderer.invoke('crear-backup-manual', periodo),

  restaurarBackupManual: () =>
    ipcRenderer.invoke('restaurar-backup-manual'),

  abrirCarpetaBackups: () =>
    ipcRenderer.invoke('abrir-carpeta-backups'),

  restaurarPeriodoManual: (periodo) =>
  ipcRenderer.invoke('restaurar-periodo-manual', periodo),
})


console.log('PRELOAD CARGADO')