/**
 * Preload de Electron.
 *
 * Este archivo define la API segura que el renderer puede usar mediante window.api.
 * Mantiene contextIsolation activado y evita exponer ipcRenderer completo al frontend.
 */
const { contextBridge, ipcRenderer } = require('electron')
const {
  IPC_CHANNELS,
} = require('./ipc/channels')

// API pública disponible en el renderer como window.api.
contextBridge.exposeInMainWorld('api', {


  // Geocoding directo: busca posibles direcciones para un texto.
  buscarDireccion: (direccion) =>
    ipcRenderer.invoke(IPC_CHANNELS.BUSCAR_DIRECCION, direccion),

  // Reverse geocoding: obtiene dirección desde coordenadas.
  obtenerDireccion: (lat, lon) =>
    ipcRenderer.invoke(IPC_CHANNELS.OBTENER_DIRECCION, lat, lon),

  obtenerEstadoGeocoding: () =>
    ipcRenderer.invoke(IPC_CHANNELS.OBTENER_ESTADO_GEOCODING),

  limpiarCacheGeocoding: () =>
    ipcRenderer.invoke(IPC_CHANNELS.LIMPIAR_CACHE_GEOCODING),

  // Carga todas las intervenciones guardadas.
  obtenerIntervenciones: () =>
    ipcRenderer.invoke(IPC_CHANNELS.OBTENER_INTERVENCIONES),

  // Inserta o actualiza una intervención.
  guardarIntervencion: (intervencion) =>
    ipcRenderer.invoke(IPC_CHANNELS.GUARDAR_INTERVENCION, intervencion),

  guardarIntervencionesMasivo: (intervenciones) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.GUARDAR_INTERVENCIONES_MASIVO,
      intervenciones
    ),

  // Elimina una intervención por id.
  eliminarIntervencion: (id) =>
    ipcRenderer.invoke(IPC_CHANNELS.ELIMINAR_INTERVENCION, id),

  obtenerHistorialIntervencion: (id) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.OBTENER_HISTORIAL_INTERVENCION,
      id
    ),

  // Crea un backup manual para el período activo.
  crearBackupManual: (periodo) =>
    ipcRenderer.invoke(IPC_CHANNELS.CREAR_BACKUP_MANUAL, periodo),

  crearBackupPreventivo: (motivo) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.CREAR_BACKUP_PREVENTIVO,
      motivo
    ),

  // Restaura una base completa desde un backup.
  restaurarBackupManual: () =>
    ipcRenderer.invoke(IPC_CHANNELS.RESTAURAR_BACKUP_MANUAL),

  // Abre la carpeta activa de backups.
  abrirCarpetaBackups: () =>
    ipcRenderer.invoke(IPC_CHANNELS.ABRIR_CARPETA_BACKUPS),

  // Restaura solo un período desde un backup.
  restaurarPeriodoManual: (periodo) =>
    ipcRenderer.invoke(IPC_CHANNELS.RESTAURAR_PERIODO_MANUAL, periodo),

  // Devuelve rutas internas y estado técnico de la app.
  obtenerEstadoApp: () =>
    ipcRenderer.invoke(IPC_CHANNELS.OBTENER_ESTADO_APP),

  leerArchivoDatos: (nombreArchivo) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.LEER_ARCHIVO_DATOS,
      nombreArchivo
    ),

  // Permite seleccionar una nueva carpeta de backups.
  configurarCarpetaBackups: () =>
    ipcRenderer.invoke(
      IPC_CHANNELS.CONFIGURAR_CARPETA_BACKUPS
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
    ipcRenderer.invoke(IPC_CHANNELS.CONFIRMAR_CIERRE_APP),
})







