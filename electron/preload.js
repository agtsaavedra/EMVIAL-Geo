/**
 * Preload de Electron.
 *
 * Este archivo define la API segura que el renderer puede usar mediante window.api.
 * Mantiene contextIsolation activado y evita exponer ipcRenderer completo al frontend.
 */
const { contextBridge, ipcRenderer } = require('electron')

// API pública disponible en el renderer como window.api.
contextBridge.exposeInMainWorld('api', {


  // Geocoding directo: busca posibles direcciones para un texto.
  buscarDireccion: (direccion) =>
    ipcRenderer.invoke('buscar-direccion', direccion),

  // Reverse geocoding: obtiene dirección desde coordenadas.
  obtenerDireccion: (lat, lon) =>
    ipcRenderer.invoke('obtener-direccion', lat, lon),

  obtenerEstadoGeocoding: () =>
    ipcRenderer.invoke('obtener-estado-geocoding'),

  limpiarCacheGeocoding: () =>
    ipcRenderer.invoke('limpiar-cache-geocoding'),

  // Carga todas las intervenciones guardadas.
  obtenerIntervenciones: () =>
    ipcRenderer.invoke('obtener-intervenciones'),

  // Inserta o actualiza una intervención.
  guardarIntervencion: (intervencion) =>
    ipcRenderer.invoke('guardar-intervencion', intervencion),

  guardarIntervencionesMasivo: (intervenciones) =>
    ipcRenderer.invoke(
      'guardar-intervenciones-masivo',
      intervenciones
    ),

  // Elimina una intervención por id.
  eliminarIntervencion: (id) =>
    ipcRenderer.invoke('eliminar-intervencion', id),

  obtenerHistorialIntervencion: (id) =>
    ipcRenderer.invoke(
      'obtener-historial-intervencion',
      id
    ),

  // Crea un backup manual para el período activo.
  crearBackupManual: (periodo) =>
    ipcRenderer.invoke('crear-backup-manual', periodo),

  crearBackupPreventivo: (motivo) =>
    ipcRenderer.invoke(
      'crear-backup-preventivo',
      motivo
    ),

  // Restaura una base completa desde un backup.
  restaurarBackupManual: () =>
    ipcRenderer.invoke('restaurar-backup-manual'),

  // Abre la carpeta activa de backups.
  abrirCarpetaBackups: () =>
    ipcRenderer.invoke('abrir-carpeta-backups'),

  // Restaura solo un período desde un backup.
  restaurarPeriodoManual: (periodo) =>
    ipcRenderer.invoke('restaurar-periodo-manual', periodo),

  // Devuelve rutas internas y estado técnico de la app.
  obtenerEstadoApp: () =>
    ipcRenderer.invoke('obtener-estado-app'),

  leerArchivoDatos: (nombreArchivo) =>
    ipcRenderer.invoke(
      'leer-archivo-datos',
      nombreArchivo
    ),

  // Permite seleccionar una nueva carpeta de backups.
  configurarCarpetaBackups: () =>
    ipcRenderer.invoke(
      'configurar-carpeta-backups'
    ),

  // Suscribe al renderer al pedido de cierre emitido por el proceso principal.
  onAppCloseRequest: (callback) => {
    const listener = () => callback()

    ipcRenderer.on(
      'app-close-request',
      listener
    )

    return () => {
      ipcRenderer.removeListener(
        'app-close-request',
        listener
      )
    }
  },

  // Confirma al proceso principal que puede cerrar la aplicación.
  confirmarCierreApp: () =>
    ipcRenderer.invoke('confirmar-cierre-app'),
})







