/**
 * Hook adaptador de props para `Topbar`.
 *
 * Reordena acciones, filtros, búsqueda, tema, backups y carga de imagen guía
 * para entregar una API simple al componente superior.
 */

// Punto de entrada público del hook.
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
  // API pública que consume el resto de la aplicación.
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
