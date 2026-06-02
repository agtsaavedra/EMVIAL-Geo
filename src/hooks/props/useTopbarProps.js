export function useTopbarProps({
  periodoActivo,
  manejarCambioPeriodo,

  filtroObra,
  setFiltroObra,

  filtroEstado,
  setFiltroEstado,

  busqueda,
  setBusqueda,

  modoOscuro,
  setModoOscuro,

  menuAbierto,
  setMenuAbierto,

  abrirAboutDesdeMenu,

  exportarKmlActual,
  exportarExcelActual,

  crearBackupActual,
  restaurarBackupActual,
  restaurarPeriodoActualProtegido,

  abrirCarpetaBackups,
  configurarCarpetaBackups,

  cargarImagenGuia,
}) {
  return {
    periodoActivo,
    setPeriodoActivo:
      manejarCambioPeriodo,

    filtroObra,
    setFiltroObra,

    filtroEstado,
    setFiltroEstado,

    busqueda,
    setBusqueda,

    modoOscuro,
    setModoOscuro,

    menuAbierto,
    setMenuAbierto,

    abrirAbout:
      abrirAboutDesdeMenu,

    exportarKmlActual,
    exportarExcelActual,

    crearBackup:
      crearBackupActual,

    restaurarBackup:
      restaurarBackupActual,

    restaurarPeriodoActual:
      restaurarPeriodoActualProtegido,

    abrirCarpetaBackups,
    configurarCarpetaBackups,

    cargarImagenGuia,
  }
}
