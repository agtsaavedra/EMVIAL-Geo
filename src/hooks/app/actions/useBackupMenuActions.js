export function useBackupMenuActions({
  periodoActivo,
  modoConsulta,
  setMenuAbierto,
  mostrarToast,
  confirmar,
  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,
  abrirAbout,
}) {
  async function crearBackupActual() {
    setMenuAbierto(false)

    const resultado = await crearBackup()

    mostrarToast(
      resultado?.message || 'Backup creado correctamente.',
      resultado?.ok === false ? 'error' : 'success'
    )
  }

  function restaurarBackupActual() {
    setMenuAbierto(false)

    if (modoConsulta) {
      mostrarToast(
        'El modo consulta esta activo. Desactivalo para restaurar backups.',
        'error'
      )
      return
    }

    confirmar({
      titulo: 'Restaurar backup',
      mensaje:
        'Se reemplazara la base actual por el backup seleccionado.',
      detalle:
        'Esta accion sobrescribira la informacion actual.',
      textoConfirmar: 'Restaurar',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        const resultado = await restaurarBackup()

        mostrarToast(
          resultado?.message ||
            'Backup restaurado correctamente.',
          resultado?.ok === false ? 'error' : 'success'
        )
      },
    })
  }

  function restaurarPeriodoActualProtegido() {
    setMenuAbierto(false)

    if (modoConsulta) {
      mostrarToast(
        'El modo consulta esta activo. Desactivalo para restaurar periodos.',
        'error'
      )
      return
    }

    confirmar({
      titulo: 'Restaurar periodo',
      mensaje: `Se restauraran unicamente las intervenciones del periodo ${periodoActivo}.`,
      detalle: 'Los demas periodos no se modificaran.',
      textoConfirmar: 'Restaurar periodo',
      textoCancelar: 'Cancelar',
      danger: true,
      onConfirmar: async () => {
        const resultado = await restaurarPeriodoActual()

        mostrarToast(
          resultado?.message ||
            'Periodo restaurado correctamente.',
          resultado?.ok === false ? 'error' : 'success'
        )
      },
    })
  }

  function abrirCarpetaBackups() {
    setMenuAbierto(false)
    window.api.abrirCarpetaBackups()
  }

  async function configurarCarpetaBackups() {
    setMenuAbierto(false)

    const resultado =
      await window.api.configurarCarpetaBackups()

    mostrarToast(
      resultado?.message ||
        'Carpeta de backups configurada.',
      resultado?.ok ? 'success' : 'error'
    )
  }

  function abrirAboutDesdeMenu() {
    setMenuAbierto(false)
    abrirAbout()
  }

  return {
    crearBackupActual,
    restaurarBackupActual,
    restaurarPeriodoActualProtegido,
    abrirCarpetaBackups,
    configurarCarpetaBackups,
    abrirAboutDesdeMenu,
  }
}
