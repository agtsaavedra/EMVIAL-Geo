/**
 * Barra superior de EMVIAL Geo.
 *
 * Orquesta título, búsqueda global, filtros superiores y menú hamburguesa.
 * La lógica pesada vive en subcomponentes y hooks externos.
 */

import TopbarTitle from '@components/topbar/TopbarTitle'
import TopbarFilters from '@components/topbar/TopbarFilters'
import TopbarMenu from '@components/topbar/TopbarMenu'

// Punto de entrada visual del componente.
function Topbar({
  busqueda,
  setBusqueda,

  menuAbierto,
  setMenuAbierto,

  exportarKmlActual,
  exportarExcelActual,
  exportarGeoJSONActual,
  exportarShpActual,
  exportarInformePDFActual,
  importarArchivoGISActual,

  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,

  abrirCarpetaBackups,
  configurarCarpetaBackups,

  abrirAbout,
  abrirDataQuality,

  cargarImagenGuia,

  modoOscuro = false,
  setModoOscuro = () => {},

  filtroObra = '',
  setFiltroObra = () => {},

  periodoActivo,
  setPeriodoActivo,
}) {
  // =====================================================
  // RENDER
  // =====================================================

  // Render principal del componente.
  return (
    <header className="topbar">
      <div className="topbar-main">
        <TopbarTitle />

        <input
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          placeholder="Buscar por obra, barrio o ubicacion..."
        />

        <TopbarMenu
          menuAbierto={menuAbierto}
          setMenuAbierto={setMenuAbierto}
          modoOscuro={modoOscuro}
          setModoOscuro={setModoOscuro}
          exportarKmlActual={exportarKmlActual}
          exportarExcelActual={
            exportarExcelActual
          }
          exportarGeoJSONActual={
            exportarGeoJSONActual
          }
          exportarShpActual={
            exportarShpActual
          }
          exportarInformePDFActual={
            exportarInformePDFActual
          }
          importarArchivoGISActual={
            importarArchivoGISActual
          }
          crearBackup={crearBackup}
          restaurarBackup={
            restaurarBackup
          }
          restaurarPeriodoActual={
            restaurarPeriodoActual
          }
          abrirCarpetaBackups={
            abrirCarpetaBackups
          }
          configurarCarpetaBackups={
            configurarCarpetaBackups
          }
          abrirAbout={abrirAbout}
          abrirDataQuality={
            abrirDataQuality
          }
          cargarImagenGuia={
            cargarImagenGuia
          }
        />
      </div>

      <TopbarFilters
        periodoActivo={periodoActivo}
        setPeriodoActivo={
          setPeriodoActivo
        }
        filtroObra={filtroObra}
        setFiltroObra={
          setFiltroObra
        }
      />
    </header>
  )
}

export default Topbar

