export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  CONFLICT: 'conflict',
  ERROR: 'error',
}

export function crearSyncAdapterLocal() {
  return {
    nombre: 'local',

    async obtenerEstado() {
      return {
        conectado: false,
        proveedor: 'local',
        ultimaSincronizacion: null,
      }
    },

    async encolarCambio(cambio) {
      return {
        ...cambio,
        syncStatus:
          cambio?.syncStatus ||
          SYNC_STATUS.SYNCED,
      }
    },

    async sincronizarPendientes() {
      return {
        enviados: 0,
        recibidos: 0,
        conflictos: 0,
      }
    },
  }
}

export const syncAdapter =
  crearSyncAdapterLocal()
