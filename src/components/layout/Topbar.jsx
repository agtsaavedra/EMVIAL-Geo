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
  // Este componente ahora solo orquesta:
  //
  // - título/logo
  // - búsqueda
  // - menú hamburguesa
  // - filtros superiores
  //
  // La lógica pesada fue movida a:
  // - TopbarTitle
  // - TopbarMenu
  // - TopbarFilters

  return (
    <header className="topbar">
      {/* ==========================================
          CABECERA PRINCIPAL
      =========================================== */}

      <div className="topbar-main">
        {/* Logo + título */}
        <TopbarTitle />

        {/* ======================================
            BUSCADOR GLOBAL
        ======================================= */}

        <input
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          placeholder="Buscar por obra, barrio, estado o ubicación..."
        />

        {/* ======================================
            MENÚ HAMBURGUESA
        ======================================= */}

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
        />
      </div>

      {/* ==========================================
          FILTROS SUPERIORES
      =========================================== */}

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

