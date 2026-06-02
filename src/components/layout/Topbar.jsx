import TopbarTitle from '@components/topbar/TopbarTitle'
import TopbarFilters from '@components/topbar/TopbarFilters'
import TopbarMenu from '@components/topbar/TopbarMenu'

function Topbar({
  busqueda,
  setBusqueda,

  menuAbierto,
  setMenuAbierto,

  exportarKmlActual,
  exportarExcelActual,

  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,

  abrirCarpetaBackups,
  configurarCarpetaBackups,

  abrirAbout,

  cargarImagenGuia,

  modoOscuro = false,
  setModoOscuro = () => {},

  filtroObra = '',
  setFiltroObra = () => {},

  filtroEstado = '',
  setFiltroEstado = () => {},

  periodoActivo,
  setPeriodoActivo,
}) {
  // =====================================================
  // RENDER
  // =====================================================

  return (
    <header className="topbar">
      <div className="topbar-main">
        <TopbarTitle />

        <input
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          placeholder="Buscar por obra, barrio, estado o ubicación..."
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
        filtroEstado={filtroEstado}
        setFiltroEstado={
          setFiltroEstado
        }
      />
    </header>
  )
}

export default Topbar
