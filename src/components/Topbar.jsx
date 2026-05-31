import { useEffect, useRef, useState } from 'react'
import { OBRAS, ESTADOS } from '../constants/intervenciones'
import mapPin from '../assets/map-pin.svg'

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
  filtroBarrio = '',
  setFiltroBarrio = () => {},
  barriosDisponibles = [],
  periodoActivo,
  setPeriodoActivo,
}) {
  const [avanzadoAbierto, setAvanzadoAbierto] = useState(false)
  const menuRef = useRef(null)

  const hayFiltros = filtroObra || filtroEstado || filtroBarrio

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false)
        setAvanzadoAbierto(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setMenuAbierto])

  function cerrarMenu() {
    setMenuAbierto(false)
    setAvanzadoAbierto(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="topbar-title">
          <img
            src={mapPin}
            alt="EMVIAL Geo"
            className="topbar-logo"
          />

          <div className="topbar-title-text">
            <h2>Mapa de intervenciones</h2>
            <span>Mar del Plata / Partido de General Pueyrredon</span>
          </div>
        </div>

        <div className="topbar-actions">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por obra, barrio, estado o ubicación..."
          />

          <div className="menu-wrapper" ref={menuRef}>
            <button
              type="button"
              className="menu-btn"
              aria-label="Abrir menú"
              onClick={() => setMenuAbierto((prev) => !prev)}
            >
              ☰
            </button>

            {menuAbierto && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  onClick={() => setModoOscuro((prev) => !prev)}
                >
                  {modoOscuro ? '☀️ Modo claro' : '🌙 Modo oscuro'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportarExcelActual()
                    cerrarMenu()
                  }}
                >
                  Exportar Excel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportarKmlActual()
                    cerrarMenu()
                  }}
                >
                  Exportar KML
                </button>

                <button
                  type="button"
                  onClick={() => {
                    crearBackup()
                    cerrarMenu()
                  }}
                >
                  Crear backup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    abrirCarpetaBackups()
                    cerrarMenu()
                  }}
                >
                  Abrir carpeta de backups
                </button>

                <button
                  type="button"
                  onClick={() => {
                    abrirAbout()
                    cerrarMenu()
                  }}
                >
                  Acerca de EMVIAL Geo
                </button>

                <div className="menu-advanced">
                  <button
                    type="button"
                    className="menu-advanced-toggle"
                    onClick={() => setAvanzadoAbierto((prev) => !prev)}
                  >
                    <span>{avanzadoAbierto ? '▾' : '▸'}</span>
                    Opciones avanzadas
                  </button>

                  {avanzadoAbierto && (
                    <div className="menu-advanced-content">
                      <button
                        type="button"
                        onClick={() => {
                          configurarCarpetaBackups()
                          cerrarMenu()
                        }}
                      >
                        Configurar carpeta de backups
                      </button>

                      <button
                        type="button"
                        className="danger-menu-item"
                        onClick={() => {
                          restaurarBackup()
                          cerrarMenu()
                        }}
                      >
                        Restaurar backup completo
                      </button>

                      <button
                        type="button"
                        className="danger-menu-item"
                        onClick={() => {
                          restaurarPeriodoActual()
                          cerrarMenu()
                        }}
                      >
                        Restaurar período actual
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-filters">
        <input
          type="month"
          value={periodoActivo}
          onChange={(e) => setPeriodoActivo(e.target.value)}
          title="Seleccionar mes de trabajo"
          className="periodo-input"
        />

        <select
          value={filtroObra}
          onChange={(e) => setFiltroObra(e.target.value)}
        >
          <option value="">Todas las obras</option>

          {OBRAS.map((obra) => (
            <option key={obra} value={obra}>
              {obra}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>

          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <select
          value={filtroBarrio}
          onChange={(e) => setFiltroBarrio(e.target.value)}
        >
          <option value="">Todos los barrios</option>

          {barriosDisponibles.map((barrio) => (
            <option key={barrio} value={barrio}>
              {barrio}
            </option>
          ))}
        </select>

        {hayFiltros && (
          <button
            type="button"
            className="clear-filters-btn"
            title="Limpiar filtros"
            onClick={() => {
              setFiltroObra('')
              setFiltroEstado('')
              setFiltroBarrio('')
            }}
          >
            ✕
          </button>
        )}
      </div>
    </header>
  )
}

export default Topbar
